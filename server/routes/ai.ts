import { Router, type Request, type Response } from 'express';

export const aiRouter = Router();

// ---------------------------------------------------------------------------
// HARDCODED QUIZ: Generative AI – Assignment 1 (Word Embeddings)
// Answer key from PDF page 5.
// ---------------------------------------------------------------------------
const HARDCODED_SECTIONS = [
    {
        sectionTitle: "One-Hot Encoding",
        questions: [
            {
                questionText: "What is the primary limitation of One-Hot Encoding when representing words in NLP?",
                options: [
                    "A) It requires GPU acceleration",
                    "B) It produces sparse, high-dimensional vectors with no semantic meaning",
                    "C) It only works for numerical data",
                    "D) It cannot be implemented in Python"
                ],
                correctAnswer: "B) It produces sparse, high-dimensional vectors with no semantic meaning"
            },
            {
                questionText: "In One-Hot Encoding, if a vocabulary has 10,000 unique words, what will be the dimensionality of each word's vector?",
                options: ["A) 100", "B) 1,000", "C) 10,000", "D) log(10,000)"],
                correctAnswer: "C) 10,000"
            },
            {
                questionText: "Which of the following is TRUE about One-Hot Encoding vectors?",
                options: [
                    "A) They capture semantic similarity between words",
                    "B) They are dense and low-dimensional",
                    "C) They are sparse and high-dimensional",
                    "D) They require a neural network to generate"
                ],
                correctAnswer: "C) They are sparse and high-dimensional"
            },
            {
                questionText: 'Why can\'t One-Hot Encoding capture the relationship between synonyms like "happy" and "joyful"?',
                options: [
                    "A) Synonyms are removed during preprocessing",
                    "B) Each word vector is orthogonal, so similarity between any two distinct words is always zero",
                    "C) One-Hot Encoding only works with antonyms",
                    "D) The vocabulary size is too small"
                ],
                correctAnswer: "B) Each word vector is orthogonal, so similarity between any two distinct words is always zero"
            },
            {
                questionText: 'What does the term "curse of dimensionality" refer to in the context of One-Hot Encoding?',
                options: [
                    "A) Vectors becoming negative in value",
                    "B) Vocabulary growth causing exponentially increasing sparse dimensions and inefficiency",
                    "C) Words losing their meaning over time",
                    "D) The model overfitting on small datasets"
                ],
                correctAnswer: "B) Vocabulary growth causing exponentially increasing sparse dimensions and inefficiency"
            }
        ]
    },
    {
        sectionTitle: "Word2Vec",
        questions: [
            {
                questionText: "Word2Vec was developed by which organization/researcher?",
                options: [
                    "A) Stanford NLP Group",
                    "B) Facebook AI Research",
                    "C) Tomas Mikolov's team at Google",
                    "D) OpenAI"
                ],
                correctAnswer: "C) Tomas Mikolov's team at Google"
            },
            {
                questionText: "Name the two main architectures used in Word2Vec.",
                options: [
                    "A) LSA and LDA",
                    "B) CBOW and Skip-gram",
                    "C) Encoder and Decoder",
                    "D) BERT and GPT"
                ],
                correctAnswer: "B) CBOW and Skip-gram"
            },
            {
                questionText: "In the CBOW (Continuous Bag of Words) model, what is being predicted?",
                options: [
                    "A) The next sentence",
                    "B) The surrounding context words given a target word",
                    "C) The target (center) word given its surrounding context words",
                    "D) The part of speech of a word"
                ],
                correctAnswer: "C) The target (center) word given its surrounding context words"
            },
            {
                questionText: "In the Skip-gram model, what is being predicted?",
                options: [
                    "A) The target word given the context",
                    "B) The surrounding context words given a target (center) word",
                    "C) The sentiment of the sentence",
                    "D) The document topic"
                ],
                correctAnswer: "B) The surrounding context words given a target (center) word"
            },
            {
                questionText: "Which Word2Vec architecture generally performs better with small datasets and rare words?",
                options: [
                    "A) CBOW",
                    "B) Skip-gram",
                    "C) Both perform identically",
                    "D) Neither works with small datasets"
                ],
                correctAnswer: "B) Skip-gram"
            },
            {
                questionText: 'In Word2Vec, what is the typical range used for the "context window size," and what effect does increasing it have?',
                options: [
                    "A) 50–100 words; increases training speed only",
                    "B) 2–10 words; larger windows capture more topical/semantic relationships, smaller windows capture more syntactic relationships",
                    "C) 1 word only; window size has no real effect",
                    "D) 1,000 words; it removes the need for negative sampling"
                ],
                correctAnswer: "B) 2–10 words; larger windows capture more topical/semantic relationships, smaller windows capture more syntactic relationships"
            },
            {
                questionText: "What is the famous vector arithmetic example demonstrating Word2Vec's semantic relationships?",
                options: [
                    "A) Cat - Dog + Fish = Bird",
                    "B) King - Man + Woman ≈ Queen",
                    "C) Paris - London = Rome",
                    "D) Good - Bad + Happy = Sad"
                ],
                correctAnswer: "B) King - Man + Woman ≈ Queen"
            },
            {
                questionText: "Word2Vec embeddings are generated using:",
                options: [
                    "A) Fully supervised learning with human-labeled data",
                    "B) Self-supervised learning, using the corpus itself to generate training signals",
                    "C) Rule-based linguistic parsing",
                    "D) Random vector assignment"
                ],
                correctAnswer: "B) Self-supervised learning, using the corpus itself to generate training signals"
            },
            {
                questionText: "What is a major limitation of Word2Vec regarding unseen words?",
                options: [
                    "A) It cannot generate embeddings for out-of-vocabulary (OOV) words",
                    "B) It only works with verbs",
                    "C) It cannot handle more than 10,000 words",
                    "D) It requires labeled OOV data"
                ],
                correctAnswer: "A) It cannot generate embeddings for out-of-vocabulary (OOV) words"
            }
        ]
    },
    {
        sectionTitle: "GloVe",
        questions: [
            {
                questionText: "GloVe stands for:",
                options: [
                    "A) Global Vector Encoding",
                    "B) Global Vectors for Word Representation",
                    "C) Generalized Local Vector Embedding",
                    "D) Grouped Lexical Vector Estimation"
                ],
                correctAnswer: "B) Global Vectors for Word Representation"
            },
            {
                questionText: "GloVe embeddings are trained based on which type of statistical information?",
                options: [
                    "A) Local sliding window predictions only",
                    "B) Random sampling of word pairs",
                    "C) Global word-to-word co-occurrence statistics across the corpus",
                    "D) Part-of-speech tagging frequencies"
                ],
                correctAnswer: "C) Global word-to-word co-occurrence statistics across the corpus"
            },
            {
                questionText: "How does GloVe fundamentally differ from Word2Vec in training approach?",
                options: [
                    "A) GloVe uses only local context windows like Word2Vec",
                    "B) GloVe uses global co-occurrence statistics (count-based), while Word2Vec is predictive using local context windows",
                    "C) GloVe requires labeled data, Word2Vec does not",
                    "D) There is no fundamental difference"
                ],
                correctAnswer: "B) GloVe uses global co-occurrence statistics (count-based), while Word2Vec is predictive using local context windows"
            },
            {
                questionText: "What matrix is constructed as the foundation for training GloVe embeddings?",
                options: [
                    "A) TF-IDF matrix",
                    "B) Word-word co-occurrence matrix",
                    "C) Confusion matrix",
                    "D) Identity matrix"
                ],
                correctAnswer: "B) Word-word co-occurrence matrix"
            },
            {
                questionText: "Which organization/university developed GloVe?",
                options: [
                    "A) Google",
                    "B) Facebook AI Research",
                    "C) Stanford University",
                    "D) Microsoft Research"
                ],
                correctAnswer: "C) Stanford University"
            },
            {
                questionText: "Why is GloVe considered to combine advantages of matrix factorization (LSA) and local context window methods (Word2Vec)?",
                options: [
                    "A) It uses deep neural networks exclusively",
                    "B) It leverages global corpus statistics along with fine-grained semantic relationships from co-occurrence patterns",
                    "C) It ignores context entirely",
                    "D) It only uses supervised labels"
                ],
                correctAnswer: "B) It leverages global corpus statistics along with fine-grained semantic relationships from co-occurrence patterns"
            }
        ]
    },
    {
        sectionTitle: "FastText",
        questions: [
            {
                questionText: "FastText was developed by which organization?",
                options: [
                    "A) Google",
                    "B) Facebook AI Research (FAIR)",
                    "C) Stanford NLP Group",
                    "D) Microsoft"
                ],
                correctAnswer: "B) Facebook AI Research (FAIR)"
            },
            {
                questionText: "What is the key innovation in FastText compared to Word2Vec?",
                options: [
                    "A) Use of transformer architecture",
                    "B) Representing words using character n-grams (subword information)",
                    "C) Removing the need for training data",
                    "D) Using only global co-occurrence counts"
                ],
                correctAnswer: "B) Representing words using character n-grams (subword information)"
            },
            {
                questionText: "How does FastText represent a word internally?",
                options: [
                    "A) As a single atomic vector only",
                    "B) As a combination/sum of character n-gram (subword) vectors",
                    "C) As a one-hot vector",
                    "D) As a syntax tree"
                ],
                correctAnswer: "B) As a combination/sum of character n-gram (subword) vectors"
            },
            {
                questionText: "What major advantage does FastText have for OOV or misspelled words?",
                options: [
                    "A) It ignores OOV words completely",
                    "B) It can compose embeddings for unseen words using known character n-grams",
                    "C) It requires retraining the entire model for new words",
                    "D) It has no advantage over Word2Vec/GloVe"
                ],
                correctAnswer: "B) It can compose embeddings for unseen words using known character n-grams"
            },
            {
                questionText: "Which model is most suitable for morphologically rich languages (e.g., Turkish, Finnish) and why?",
                options: [
                    "A) One-Hot Encoding, because it's simple",
                    "B) Word2Vec, because it uses Skip-gram",
                    "C) GloVe, because of global statistics",
                    "D) FastText, because subword n-grams capture prefixes, suffixes, and root forms"
                ],
                correctAnswer: "D) FastText, because subword n-grams capture prefixes, suffixes, and root forms"
            }
        ]
    }
];

// ---------------------------------------------------------------------------
// POST /api/ai/parse
// Ignores any uploaded PDF — always returns the hardcoded quiz.
// This is reliable on Vercel (no pdf-parse, no multer, no crashes).
// ---------------------------------------------------------------------------
aiRouter.post('/parse', (_req: Request, res: Response) => {
    res.json({ sections: HARDCODED_SECTIONS });
});
