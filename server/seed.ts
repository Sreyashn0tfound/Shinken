/**
 * Run once to seed the hardcoded quiz into the database:
 *   npx tsx server/seed.ts
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const QUIZ_TITLE = "Generative AI – Assignment 1: Word Embeddings";
const TEACHER_ID = "system"; // system-owned quiz

const QUESTIONS = [
    {
        title: "Q1. Primary limitation of One-Hot Encoding",
        text: "What is the primary limitation of One-Hot Encoding when representing words in NLP?",
        options: [
            "A) It requires GPU acceleration",
            "B) It produces sparse, high-dimensional vectors with no semantic meaning",
            "C) It only works for numerical data",
            "D) It cannot be implemented in Python"
        ],
        correctAnswer: "B) It produces sparse, high-dimensional vectors with no semantic meaning"
    },
    {
        title: "Q2. One-Hot dimensionality",
        text: "In One-Hot Encoding, if a vocabulary has 10,000 unique words, what will be the dimensionality of each word's vector?",
        options: ["A) 100", "B) 1,000", "C) 10,000", "D) log(10,000)"],
        correctAnswer: "C) 10,000"
    },
    {
        title: "Q3. TRUE about One-Hot Encoding vectors",
        text: "Which of the following is TRUE about One-Hot Encoding vectors?",
        options: [
            "A) They capture semantic similarity between words",
            "B) They are dense and low-dimensional",
            "C) They are sparse and high-dimensional",
            "D) They require a neural network to generate"
        ],
        correctAnswer: "C) They are sparse and high-dimensional"
    },
    {
        title: "Q4. Synonyms in One-Hot Encoding",
        text: 'Why can\'t One-Hot Encoding capture the relationship between synonyms like "happy" and "joyful"?',
        options: [
            "A) Synonyms are removed during preprocessing",
            "B) Each word vector is orthogonal, so similarity between any two distinct words is always zero",
            "C) One-Hot Encoding only works with antonyms",
            "D) The vocabulary size is too small"
        ],
        correctAnswer: "B) Each word vector is orthogonal, so similarity between any two distinct words is always zero"
    },
    {
        title: "Q5. Curse of dimensionality",
        text: 'What does the term "curse of dimensionality" refer to in the context of One-Hot Encoding?',
        options: [
            "A) Vectors becoming negative in value",
            "B) Vocabulary growth causing exponentially increasing sparse dimensions and inefficiency",
            "C) Words losing their meaning over time",
            "D) The model overfitting on small datasets"
        ],
        correctAnswer: "B) Vocabulary growth causing exponentially increasing sparse dimensions and inefficiency"
    },
    {
        title: "Q6. Word2Vec developer",
        text: "Word2Vec was developed by which organization/researcher?",
        options: [
            "A) Stanford NLP Group",
            "B) Facebook AI Research",
            "C) Tomas Mikolov's team at Google",
            "D) OpenAI"
        ],
        correctAnswer: "C) Tomas Mikolov's team at Google"
    },
    {
        title: "Q7. Word2Vec architectures",
        text: "Name the two main architectures used in Word2Vec.",
        options: [
            "A) LSA and LDA",
            "B) CBOW and Skip-gram",
            "C) Encoder and Decoder",
            "D) BERT and GPT"
        ],
        correctAnswer: "B) CBOW and Skip-gram"
    },
    {
        title: "Q8. CBOW prediction",
        text: "In the CBOW (Continuous Bag of Words) model, what is being predicted?",
        options: [
            "A) The next sentence",
            "B) The surrounding context words given a target word",
            "C) The target (center) word given its surrounding context words",
            "D) The part of speech of a word"
        ],
        correctAnswer: "C) The target (center) word given its surrounding context words"
    },
    {
        title: "Q9. Skip-gram prediction",
        text: "In the Skip-gram model, what is being predicted?",
        options: [
            "A) The target word given the context",
            "B) The surrounding context words given a target (center) word",
            "C) The sentiment of the sentence",
            "D) The document topic"
        ],
        correctAnswer: "B) The surrounding context words given a target (center) word"
    },
    {
        title: "Q10. Word2Vec architecture for small datasets",
        text: "Which Word2Vec architecture generally performs better with small datasets and rare words?",
        options: [
            "A) CBOW",
            "B) Skip-gram",
            "C) Both perform identically",
            "D) Neither works with small datasets"
        ],
        correctAnswer: "B) Skip-gram"
    },
    {
        title: "Q11. Context window size in Word2Vec",
        text: 'In Word2Vec, what is the typical range used for the "context window size," and what effect does increasing it have?',
        options: [
            "A) 50–100 words; increases training speed only",
            "B) 2–10 words; larger windows capture more topical/semantic relationships, smaller windows capture more syntactic relationships",
            "C) 1 word only; window size has no real effect",
            "D) 1,000 words; it removes the need for negative sampling"
        ],
        correctAnswer: "B) 2–10 words; larger windows capture more topical/semantic relationships, smaller windows capture more syntactic relationships"
    },
    {
        title: "Q12. Famous vector arithmetic example",
        text: "What is the famous vector arithmetic example demonstrating Word2Vec's semantic relationships?",
        options: [
            "A) Cat - Dog + Fish = Bird",
            "B) King - Man + Woman ≈ Queen",
            "C) Paris - London = Rome",
            "D) Good - Bad + Happy = Sad"
        ],
        correctAnswer: "B) King - Man + Woman ≈ Queen"
    },
    {
        title: "Q13. Word2Vec learning type",
        text: "Word2Vec embeddings are generated using:",
        options: [
            "A) Fully supervised learning with human-labeled data",
            "B) Self-supervised learning, using the corpus itself to generate training signals",
            "C) Rule-based linguistic parsing",
            "D) Random vector assignment"
        ],
        correctAnswer: "B) Self-supervised learning, using the corpus itself to generate training signals"
    },
    {
        title: "Q14. Word2Vec OOV limitation",
        text: "What is a major limitation of Word2Vec regarding unseen words?",
        options: [
            "A) It cannot generate embeddings for out-of-vocabulary (OOV) words",
            "B) It only works with verbs",
            "C) It cannot handle more than 10,000 words",
            "D) It requires labeled OOV data"
        ],
        correctAnswer: "A) It cannot generate embeddings for out-of-vocabulary (OOV) words"
    },
    {
        title: "Q15. GloVe stands for",
        text: "GloVe stands for:",
        options: [
            "A) Global Vector Encoding",
            "B) Global Vectors for Word Representation",
            "C) Generalized Local Vector Embedding",
            "D) Grouped Lexical Vector Estimation"
        ],
        correctAnswer: "B) Global Vectors for Word Representation"
    },
    {
        title: "Q16. GloVe training data",
        text: "GloVe embeddings are trained based on which type of statistical information?",
        options: [
            "A) Local sliding window predictions only",
            "B) Random sampling of word pairs",
            "C) Global word-to-word co-occurrence statistics across the corpus",
            "D) Part-of-speech tagging frequencies"
        ],
        correctAnswer: "C) Global word-to-word co-occurrence statistics across the corpus"
    },
    {
        title: "Q17. GloVe vs Word2Vec",
        text: "How does GloVe fundamentally differ from Word2Vec in training approach?",
        options: [
            "A) GloVe uses only local context windows like Word2Vec",
            "B) GloVe uses global co-occurrence statistics (count-based), while Word2Vec is predictive using local context windows",
            "C) GloVe requires labeled data, Word2Vec does not",
            "D) There is no fundamental difference"
        ],
        correctAnswer: "B) GloVe uses global co-occurrence statistics (count-based), while Word2Vec is predictive using local context windows"
    },
    {
        title: "Q18. GloVe foundation matrix",
        text: "What matrix is constructed as the foundation for training GloVe embeddings?",
        options: [
            "A) TF-IDF matrix",
            "B) Word-word co-occurrence matrix",
            "C) Confusion matrix",
            "D) Identity matrix"
        ],
        correctAnswer: "B) Word-word co-occurrence matrix"
    },
    {
        title: "Q19. GloVe developer",
        text: "Which organization/university developed GloVe?",
        options: [
            "A) Google",
            "B) Facebook AI Research",
            "C) Stanford University",
            "D) Microsoft Research"
        ],
        correctAnswer: "C) Stanford University"
    },
    {
        title: "Q20. GloVe combining LSA and Word2Vec",
        text: "Why is GloVe considered to combine advantages of matrix factorization (LSA) and local context window methods (Word2Vec)?",
        options: [
            "A) It uses deep neural networks exclusively",
            "B) It leverages global corpus statistics along with fine-grained semantic relationships from co-occurrence patterns",
            "C) It ignores context entirely",
            "D) It only uses supervised labels"
        ],
        correctAnswer: "B) It leverages global corpus statistics along with fine-grained semantic relationships from co-occurrence patterns"
    },
    {
        title: "Q21. FastText developer",
        text: "FastText was developed by which organization?",
        options: [
            "A) Google",
            "B) Facebook AI Research (FAIR)",
            "C) Stanford NLP Group",
            "D) Microsoft"
        ],
        correctAnswer: "B) Facebook AI Research (FAIR)"
    },
    {
        title: "Q22. FastText key innovation",
        text: "What is the key innovation in FastText compared to Word2Vec?",
        options: [
            "A) Use of transformer architecture",
            "B) Representing words using character n-grams (subword information)",
            "C) Removing the need for training data",
            "D) Using only global co-occurrence counts"
        ],
        correctAnswer: "B) Representing words using character n-grams (subword information)"
    },
    {
        title: "Q23. FastText internal representation",
        text: "How does FastText represent a word internally?",
        options: [
            "A) As a single atomic vector only",
            "B) As a combination/sum of character n-gram (subword) vectors",
            "C) As a one-hot vector",
            "D) As a syntax tree"
        ],
        correctAnswer: "B) As a combination/sum of character n-gram (subword) vectors"
    },
    {
        title: "Q24. FastText OOV advantage",
        text: "What major advantage does FastText have for OOV or misspelled words?",
        options: [
            "A) It ignores OOV words completely",
            "B) It can compose embeddings for unseen words using known character n-grams",
            "C) It requires retraining the entire model for new words",
            "D) It has no advantage over Word2Vec/GloVe"
        ],
        correctAnswer: "B) It can compose embeddings for unseen words using known character n-grams"
    },
    {
        title: "Q25. Best model for morphologically rich languages",
        text: "Which model is most suitable for morphologically rich languages (e.g., Turkish, Finnish) and why?",
        options: [
            "A) One-Hot Encoding, because it's simple",
            "B) Word2Vec, because it uses Skip-gram",
            "C) GloVe, because of global statistics",
            "D) FastText, because subword n-grams capture prefixes, suffixes, and root forms"
        ],
        correctAnswer: "D) FastText, because subword n-grams capture prefixes, suffixes, and root forms"
    }
];

async function seed() {
    console.log("🌸 Seeding hardcoded quiz...");

    // Check if already seeded
    const existing = await db.select().from(schema.quizzes)
        .where(eq(schema.quizzes.teacherId, TEACHER_ID));

    if (existing.length > 0) {
        console.log(`✅ Quiz already exists (ID: ${existing[0].id}). Skipping.`);
        console.log(`   Use this quizId when initializing a session: ${existing[0].id}`);
        return;
    }

    // Insert quiz
    const [quiz] = await db.insert(schema.quizzes).values({
        teacherId: TEACHER_ID,
        title: QUIZ_TITLE,
    }).returning();

    console.log(`✅ Quiz created: ID=${quiz.id}`);

    // Insert all 25 questions
    await db.insert(schema.questions).values(
        QUESTIONS.map(q => ({
            quizId: quiz.id,
            sectionTitle: "Word Embeddings",
            title: q.title,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
        }))
    );

    console.log(`✅ 25 questions inserted.`);
    console.log(`\n🎯 Use quizId = ${quiz.id} when deploying a session from the teacher dashboard.`);
}

seed().catch(console.error);
