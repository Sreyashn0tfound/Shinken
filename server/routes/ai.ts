import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';

export const aiRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

interface ParsedQuestion {
    questionText: string;
    options: string[];
    correctAnswer: string;
}

interface ParsedSection {
    sectionTitle: string;
    questions: ParsedQuestion[];
}

/**
 * Parses raw exam text deterministically.
 */
function parseExamText(rawText: string): ParsedSection[] {
    const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const answerKeyMap = new Map<number, string>();
    const answerKeyRegex = /(?:answer\s*key|answers?|solutions?)[\s\S]*$/i;
    const answerKeyMatch = text.match(answerKeyRegex);

    let mainContent = text;
    if (answerKeyMatch && answerKeyMatch.index !== undefined) {
        const keyBlock = text.slice(answerKeyMatch.index);
        mainContent = text.slice(0, answerKeyMatch.index);

        const keyItemRegex = /(?:Q\s*)?(\d+)[\s.:)-]+([A-Da-d])/g;
        let match: RegExpExecArray | null;
        while ((match = keyItemRegex.exec(keyBlock)) !== null) {
            const qNum = parseInt(match[1], 10);
            answerKeyMap.set(qNum, match[2].toUpperCase());
        }
    }

    const sectionHeaderRegex = /(?:^|\n)(SECTION\s+[A-Z0-9]+[^\n]*|PART\s+[A-Z0-9]+[^\n]*|MODULE\s+[A-Z0-9]+[^\n]*)/gi;
    const sectionSplits = mainContent.split(sectionHeaderRegex).map(s => s.trim()).filter(Boolean);

    let rawSections: { title: string; body: string }[] = [];

    if (sectionSplits.length <= 1) {
        rawSections.push({ title: "SECTION 1 - GENERAL", body: mainContent });
    } else {
        let startIndex = 0;
        if (!sectionSplits[0].toUpperCase().startsWith("SECTION") &&
            !sectionSplits[0].toUpperCase().startsWith("PART") &&
            !sectionSplits[0].toUpperCase().startsWith("MODULE")) {
            rawSections.push({ title: "SECTION 1 - GENERAL", body: sectionSplits[0] });
            startIndex = 1;
        }

        for (let i = startIndex; i < sectionSplits.length; i += 2) {
            const title = sectionSplits[i];
            const body = sectionSplits[i + 1] || "";
            rawSections.push({ title: title.toUpperCase(), body });
        }
    }

    const parsedSections: ParsedSection[] = [];
    let globalQuestionCounter = 1;

    for (const sec of rawSections) {
        const questions: ParsedQuestion[] = [];
        const qBlockRegex = /(?:^|\n)(?:Q\s*)?(\d+)[\.\)]\s+/g;
        const parts = sec.body.split(qBlockRegex);

        for (let i = 1; i < parts.length; i += 2) {
            const qNum = parseInt(parts[i], 10) || globalQuestionCounter;
            const qContent = parts[i + 1]?.trim() || "";
            if (!qContent) continue;

            const optionRegex = /(?:^|\n|\s+)(?:[\(\[]?([A-Da-d])[\)\].])\s+/g;
            const optSplits = qContent.split(optionRegex);

            const questionText = optSplits[0]?.trim() || `Question ${qNum}`;
            const options: string[] = [];
            let inlineAnswerLetter: string | null = null;

            for (let j = 1; j < optSplits.length; j += 2) {
                const letter = optSplits[j]?.toUpperCase();
                let optText = optSplits[j + 1]?.trim() || "";

                if (/(?:\[ans\]|\[correct\]|\(correct\)|✅)/i.test(optText)) {
                    inlineAnswerLetter = letter;
                    optText = optText.replace(/(?:\[ans\]|\[correct\]|\(correct\)|✅)/gi, '').trim();
                }

                options.push(`${letter}) ${optText}`);
            }

            const inlineMatch = qContent.match(/(?:Ans|Answer|Correct):\s*([A-Da-d])/i);
            if (inlineMatch) {
                inlineAnswerLetter = inlineMatch[1].toUpperCase();
            }

            const targetLetter = inlineAnswerLetter || answerKeyMap.get(qNum) || "A";

            let matchedCorrectOption = options.find(o => o.startsWith(`${targetLetter})`));
            if (!matchedCorrectOption && options.length > 0) {
                matchedCorrectOption = options[0];
            }

            if (options.length >= 2) {
                questions.push({
                    questionText,
                    options,
                    correctAnswer: matchedCorrectOption || (options[0] || "A) None")
                });
            }

            globalQuestionCounter++;
        }

        if (questions.length > 0) {
            parsedSections.push({
                sectionTitle: sec.title,
                questions
            });
        }
    }

    if (parsedSections.length === 0 && mainContent.trim().length > 0) {
        return [{ sectionTitle: "SECTION 1 - MAIN EXAM", questions: [] }];
    }

    return parsedSections;
}

// 🚨 FIX: Removed inline 'type' keyword from parameters!
aiRouter.post('/parse', upload.single('file'), async (req: Request, res: Response) => {
    try {
        const { rawText } = req.body;
        let textToParse = rawText || "";

        // Safely access file using 'any' to bypass strict typing issues
        const file = (req as any).file;

        if (file) {
            const pdfData = await pdfParse(file.buffer);
            textToParse = pdfData.text;
        }

        if (!textToParse.trim()) {
            return res.status(400).json({ error: "No text or PDF file provided." });
        }

        const sections = parseExamText(textToParse);

        if (!sections.length || !sections[0].questions.length) {
            return res.status(422).json({
                error: "Could not detect numbered questions. Ensure questions follow '1. Question' and options follow 'A) ... B) ...'"
            });
        }

        res.json({ sections });
    } catch (error: any) {
        console.error("Deterministic Parse Error:", error);
        res.status(500).json({ error: "Failed to parse document format.", detail: error.message });
    }
});