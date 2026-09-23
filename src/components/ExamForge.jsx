import { useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { shogunApi } from '../api';
import FallingSakura from './FallingSakura';

// ---------------------------------------------------------------------------
// HARDCODED: Machine Learning MCQ Quiz (20 Questions × 1 Mark = 20 Marks)
// Source: ML-MCQ-Quiz-20Marks.pdf
// ---------------------------------------------------------------------------
const HARDCODED_EXAM = {
    title: "Machine Learning — MCQ Quiz",
    sections: [
        {
            sectionTitle: "Machine Learning — MCQ Quiz (20 Marks)",
            questions: [
                {
                    questionText: "Which of the following best defines Machine Learning?",
                    options: [
                        "(A) A program that is explicitly coded for every possible input",
                        "(B) A field where computers learn from experience/data to improve performance on a task without being explicitly programmed",
                        "(C) A method of storing large datasets efficiently",
                        "(D) A hardware architecture for parallel computing"
                    ],
                    correctAnswer: "(B) A field where computers learn from experience/data to improve performance on a task without being explicitly programmed"
                },
                {
                    questionText: "Supervised learning differs from unsupervised learning in that:",
                    options: [
                        "(A) Supervised learning uses labeled data; unsupervised learning uses unlabeled data",
                        "(B) Supervised learning never uses training data",
                        "(C) Unsupervised learning requires a reward signal",
                        "(D) Supervised learning is only used for clustering"
                    ],
                    correctAnswer: "(A) Supervised learning uses labeled data; unsupervised learning uses unlabeled data"
                },
                {
                    questionText: "Which is an example of unsupervised learning?",
                    options: [
                        "(A) Spam email classification",
                        "(B) Predicting house prices",
                        "(C) Customer segmentation via clustering",
                        "(D) Handwritten digit recognition"
                    ],
                    correctAnswer: "(C) Customer segmentation via clustering"
                },
                {
                    questionText: "Semi-supervised learning is best described as:",
                    options: [
                        "(A) Learning using only unlabeled data",
                        "(B) Learning using a small amount of labeled data with a large amount of unlabeled data",
                        "(C) Learning purely through trial-and-error rewards",
                        "(D) Learning that requires no data at all"
                    ],
                    correctAnswer: "(B) Learning using a small amount of labeled data with a large amount of unlabeled data"
                },
                {
                    questionText: "In Reinforcement Learning, the learner is called a/an:",
                    options: [
                        "(A) Classifier",
                        "(B) Agent",
                        "(C) Cluster",
                        "(D) Regressor"
                    ],
                    correctAnswer: "(B) Agent"
                },
                {
                    questionText: "What signal guides learning in Reinforcement Learning?",
                    options: [
                        "(A) Labeled input-output pairs",
                        "(B) Cluster centroids",
                        "(C) Reward or penalty from the environment",
                        "(D) Feature correlation matrix"
                    ],
                    correctAnswer: "(C) Reward or penalty from the environment"
                },
                {
                    questionText: "Training data is used to:",
                    options: [
                        "(A) Evaluate final model performance only",
                        "(B) Fit/build the model's parameters",
                        "(C) Store the deployed model",
                        "(D) Replace the need for testing entirely"
                    ],
                    correctAnswer: "(B) Fit/build the model's parameters"
                },
                {
                    questionText: "Why must training and testing data be kept separate?",
                    options: [
                        "(A) To reduce computation cost only",
                        "(B) To prevent an overly optimistic/biased estimate of model performance",
                        "(C) Because algorithms cannot process combined data",
                        "(D) It is a legal requirement"
                    ],
                    correctAnswer: "(B) To prevent an overly optimistic/biased estimate of model performance"
                },
                {
                    questionText: "Which of the following is NOT a typical cause of poor-quality data?",
                    options: [
                        "(A) Missing values",
                        "(B) Sensor/measurement errors",
                        "(C) Well-labeled, noise-free records",
                        "(D) Duplicate or inconsistent entries"
                    ],
                    correctAnswer: "(C) Well-labeled, noise-free records"
                },
                {
                    questionText: "Irrelevant features in a dataset primarily cause:",
                    options: [
                        "(A) Faster and more accurate training always",
                        "(B) Added noise, higher computation, and potential spurious correlations",
                        "(C) Guaranteed improvement in model generalization",
                        "(D) Elimination of the need for feature selection"
                    ],
                    correctAnswer: "(B) Added noise, higher computation, and potential spurious correlations"
                },
                {
                    questionText: "Overfitting occurs when a model:",
                    options: [
                        "(A) Performs poorly on both training and test data",
                        "(B) Learns the training data (including noise) too well, hurting performance on unseen data",
                        "(C) Is too simple to capture patterns in data",
                        "(D) Has zero variance and zero bias"
                    ],
                    correctAnswer: "(B) Learns the training data (including noise) too well, hurting performance on unseen data"
                },
                {
                    questionText: "Underfitting is characterized by:",
                    options: [
                        "(A) High accuracy on training data, low accuracy on test data",
                        "(B) The model being too complex",
                        "(C) High bias, poor performance on both training and test data",
                        "(D) Perfect generalization to new data"
                    ],
                    correctAnswer: "(C) High bias, poor performance on both training and test data"
                },
                {
                    questionText: "A learning problem is 'well-posed' when it clearly specifies:",
                    options: [
                        "(A) Task (T), Performance measure (P), and Experience (E)",
                        "(B) Only the dataset size",
                        "(C) Only the programming language used",
                        "(D) Only the hardware specifications"
                    ],
                    correctAnswer: "(A) Task (T), Performance measure (P), and Experience (E)"
                },
                {
                    questionText: "For a spam-classification system, what does 'E' (Experience) represent?",
                    options: [
                        "(A) The percentage of correctly classified emails",
                        "(B) The task of labeling emails as spam or not",
                        "(C) A dataset of emails already labeled as spam/not spam",
                        "(D) The email server hardware"
                    ],
                    correctAnswer: "(C) A dataset of emails already labeled as spam/not spam"
                },
                {
                    questionText: "The FIND-S algorithm searches for:",
                    options: [
                        "(A) The most general hypothesis consistent with negative examples only",
                        "(B) The most specific hypothesis consistent with the positive training examples",
                        "(C) A random hypothesis from the version space",
                        "(D) The average of all hypotheses"
                    ],
                    correctAnswer: "(B) The most specific hypothesis consistent with the positive training examples"
                },
                {
                    questionText: "In FIND-S, how are negative training examples handled?",
                    options: [
                        "(A) They are used to specialize the hypothesis",
                        "(B) They are ignored",
                        "(C) They reset the hypothesis to null",
                        "(D) They are used to generalize the hypothesis"
                    ],
                    correctAnswer: "(B) They are ignored"
                },
                {
                    questionText: "The initial hypothesis in FIND-S is typically:",
                    options: [
                        "(A) The most general hypothesis (?, ?, ..., ?)",
                        "(B) The most specific hypothesis (∅, ∅, ..., ∅)",
                        "(C) A randomly chosen training example",
                        "(D) Undefined"
                    ],
                    correctAnswer: "(B) The most specific hypothesis (∅, ∅, ..., ∅)"
                },
                {
                    questionText: "The Candidate Elimination Algorithm maintains:",
                    options: [
                        "(A) Only a single hypothesis",
                        "(B) A Specific boundary (S) and a General boundary (G) representing the version space",
                        "(C) Only negative examples",
                        "(D) A neural network of weights"
                    ],
                    correctAnswer: "(B) A Specific boundary (S) and a General boundary (G) representing the version space"
                },
                {
                    questionText: "In Candidate Elimination, when a negative example is encountered, the algorithm:",
                    options: [
                        "(A) Generalizes S to include the negative example",
                        "(B) Specializes G to exclude hypotheses that match the negative example",
                        "(C) Deletes all hypotheses from S and G",
                        "(D) Ignores it, same as in FIND-S"
                    ],
                    correctAnswer: "(B) Specializes G to exclude hypotheses that match the negative example"
                },
                {
                    questionText: "The 'version space' in Candidate Elimination refers to:",
                    options: [
                        "(A) The set of all hypotheses consistent with the training data, bounded by S and G",
                        "(B) A single best hypothesis only",
                        "(C) The list of negative examples",
                        "(D) The number of features in the dataset"
                    ],
                    correctAnswer: "(A) The set of all hypotheses consistent with the training data, bounded by S and G"
                }
            ]
        }
    ]
};

export default function ExamForge({ onBack }) {
    const { user } = useUser();
    const [isSaving, setIsSaving] = useState(false);
    const [examTitle, setExamTitle] = useState(HARDCODED_EXAM.title);

    const handleSaveExam = async () => {
        if (!user) return alert("Not authenticated.");
        if (!examTitle.trim()) return alert("Exam title is required!");

        setIsSaving(true);
        try {
            await shogunApi.saveAIExam({
                teacherId: user.id,
                title: examTitle,
                sections: HARDCODED_EXAM.sections
            });
            alert("⚔️ EXAM SECURED! The scroll has been locked into the Iron Vault.");
            onBack();
        } catch (error) {
            alert("Vault Error: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const { sections } = HARDCODED_EXAM;

    return (
        <div style={{
            height: '100vh', width: '100%', boxSizing: 'border-box',
            backgroundColor: '#f5fff6',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
            padding: '4rem 2rem', fontFamily: "'Courier New', monospace", color: '#111',
            position: 'relative', overflowY: 'auto'
        }}>
            <FallingSakura />

            <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #8B0000', paddingBottom: '1rem', marginBottom: '3rem' }}>
                    <h1 style={{ fontFamily: "'Shojumaru', cursive", fontSize: '3rem', color: '#111', margin: 0 }}>
                        THE EXAM FORGE
                    </h1>
                    <button onClick={onBack} style={{ backgroundColor: 'transparent', color: '#8B0000', border: '3px solid #8B0000', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        BACK TO COMMAND
                    </button>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '3rem', border: '4px solid #111', boxShadow: '12px 12px 0px rgba(139,0,0,0.15)' }}>

                    {/* Info banner */}
                    <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fff8e1', border: '3px solid #f9a825' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>
                            📄 Exam loaded: <strong>Machine Learning — MCQ Quiz</strong> &nbsp;|&nbsp; 20 Questions × 1 Mark = 20 Marks
                        </p>
                    </div>

                    {/* Editable title */}
                    <input
                        type="text"
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '1rem', fontSize: '1.2rem', border: '3px solid #111', marginBottom: '2.5rem', fontWeight: 'bold' }}
                    />

                    {/* Question preview */}
                    <h2 style={{ fontFamily: "'Kaushan Script', cursive", color: '#8B0000', fontSize: '2rem', marginTop: 0, marginBottom: '1.5rem' }}>
                        Preview — {sections[0].questions.length} Questions
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                        {sections[0].questions.map((q, idx) => (
                            <div key={idx} style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', border: '2px solid #111' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
                                    Q{idx + 1}: {q.questionText}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} style={{
                                            padding: '0.5rem 0.75rem',
                                            backgroundColor: q.correctAnswer === opt ? '#e8f5e9' : 'transparent',
                                            border: q.correctAnswer === opt ? '2px solid #2e7d32' : '1px solid #ccc',
                                            fontSize: '0.9rem'
                                        }}>
                                            {opt} {q.correctAnswer === opt && "✅"}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save button */}
                    <button
                        onClick={handleSaveExam}
                        disabled={isSaving}
                        style={{
                            width: '100%', backgroundColor: isSaving ? '#555' : '#2e7d32', color: '#fff',
                            padding: '1.5rem', fontSize: '1.8rem', fontFamily: "'Shojumaru', cursive",
                            border: '4px solid #111', cursor: isSaving ? 'not-allowed' : 'pointer',
                            boxShadow: '6px 6px 0px #111'
                        }}
                    >
                        {isSaving ? "LOCKING INTO VAULT..." : "LOCK EXAM INTO DATABASE"}
                    </button>
                </div>
            </div>
        </div>
    );
}
