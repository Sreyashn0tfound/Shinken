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

export const QUESTIONS = [
  {
    title: "Reinforcement Learning Learner",
    text: "In Reinforcement Learning, the learner is called a/an:",
    options: [
      "Classifier",
      "Agent",
      "Cluster",
      "Regressor"
    ],
    correctAnswer: "Agent"
  },
  {
    title: "Definition of Machine Learning",
    text: "Which of the following best defines Machine Learning?",
    options: [
      "A program that is explicitly coded for every possible input",
      "A field where computers learn from experience/data to improve performance on a task without being explicitly programmed",
      "A method of storing large datasets efficiently",
      "A hardware architecture for parallel computing"
    ],
    correctAnswer: "A field where computers learn from experience/data to improve performance on a task without being explicitly programmed"
  },
  {
    title: "Overfitting",
    text: "Overfitting occurs when a model:",
    options: [
      "Performs poorly on both training and test data",
      "Learns the training data (including noise) too well, hurting performance on unseen data",
      "Is too simple to capture patterns in data",
      "Has zero variance and zero bias"
    ],
    correctAnswer: "Learns the training data (including noise) too well, hurting performance on unseen data"
  },
  {
    title: "Supervised vs Unsupervised",
    text: "Supervised learning differs from unsupervised learning in that:",
    options: [
      "Supervised learning uses labeled data; unsupervised learning uses unlabeled data",
      "Supervised learning never uses training data",
      "Unsupervised learning requires a reward signal",
      "Supervised learning is only used for clustering"
    ],
    correctAnswer: "Supervised learning uses labeled data; unsupervised learning uses unlabeled data"
  },
  {
    title: "Negative Examples in Candidate Elimination",
    text: "In Candidate Elimination, when a negative example is encountered, the algorithm:",
    options: [
      "Generalizes S to include the negative example",
      "Specializes G to exclude hypotheses that match the negative example",
      "Deletes all hypotheses from S and G",
      "Ignores it, same as in FIND-S"
    ],
    correctAnswer: "Specializes G to exclude hypotheses that match the negative example"
  },
  {
    title: "Training and Testing Data Separation",
    text: "Why must training and testing data be kept separate?",
    options: [
      "To reduce computation cost only",
      "To prevent an overly optimistic/biased estimate of model performance",
      "Because algorithms cannot process combined data",
      "It is a legal requirement"
    ],
    correctAnswer: "To prevent an overly optimistic/biased estimate of model performance"
  },
  {
    title: "FIND-S Algorithm Search",
    text: "The FIND-S algorithm searches for:",
    options: [
      "The most general hypothesis consistent with negative examples only",
      "The most specific hypothesis consistent with the positive training examples",
      "A random hypothesis from the version space",
      "The average of all hypotheses"
    ],
    correctAnswer: "The most specific hypothesis consistent with the positive training examples"
  },
  {
    title: "Purpose of Training Data",
    text: "Training data is used to:",
    options: [
      "Evaluate final model performance only",
      "Fit/build the model's parameters",
      "Store the deployed model",
      "Replace the need for testing entirely"
    ],
    correctAnswer: "Fit/build the model's parameters"
  },
  {
    title: "Version Space",
    text: "The 'version space' in Candidate Elimination refers to:",
    options: [
      "The set of all hypotheses consistent with the training data, bounded by S and G",
      "A single best hypothesis only",
      "The list of negative examples",
      "The number of features in the dataset"
    ],
    correctAnswer: "The set of all hypotheses consistent with the training data, bounded by S and G"
  },
  {
    title: "Irrelevant Features",
    text: "Irrelevant features in a dataset primarily cause:",
    options: [
      "Faster and more accurate training always",
      "Added noise, higher computation, and potential spurious correlations",
      "Guaranteed improvement in model generalization",
      "Elimination of the need for feature selection"
    ],
    correctAnswer: "Added noise, higher computation, and potential spurious correlations"
  },
  {
    title: "Semi-supervised Learning",
    text: "Semi-supervised learning is best described as:",
    options: [
      "Learning using only unlabeled data",
      "Learning using a small amount of labeled data with a large amount of unlabeled data",
      "Learning purely through trial-and-error rewards",
      "Learning that requires no data at all"
    ],
    correctAnswer: "Learning using a small amount of labeled data with a large amount of unlabeled data"
  },
  {
    title: "Candidate Elimination Algorithm",
    text: "The Candidate Elimination Algorithm maintains:",
    options: [
      "Only a single hypothesis",
      "A Specific boundary (S) and a General boundary (G) representing the version space",
      "Only negative examples",
      "A neural network of weights"
    ],
    correctAnswer: "A Specific boundary (S) and a General boundary (G) representing the version space"
  },
  {
    title: "Underfitting",
    text: "Underfitting is characterized by:",
    options: [
      "High accuracy on training data, low accuracy on test data",
      "The model being too complex",
      "High bias, poor performance on both training and test data",
      "Perfect generalization to new data"
    ],
    correctAnswer: "High bias, poor performance on both training and test data"
  },
  {
    title: "Initial Hypothesis in FIND-S",
    text: "The initial hypothesis in FIND-S is typically:",
    options: [
      "The most general hypothesis (?, ?, ..., ?)",
      "The most specific hypothesis (∅, ∅, ..., ∅)",
      "A randomly chosen training example",
      "Undefined"
    ],
    correctAnswer: "The most specific hypothesis (∅, ∅, ..., ∅)"
  },
  {
    title: "Unsupervised Learning Example",
    text: "Which is an example of unsupervised learning?",
    options: [
      "Spam email classification",
      "Predicting house prices",
      "Customer segmentation via clustering",
      "Handwritten digit recognition"
    ],
    correctAnswer: "Customer segmentation via clustering"
  },
  {
    title: "Negative Examples in FIND-S",
    text: "In FIND-S, how are negative training examples handled?",
    options: [
      "They are used to specialize the hypothesis",
      "They are ignored",
      "They reset the hypothesis to null",
      "They are used to generalize the hypothesis"
    ],
    correctAnswer: "They are ignored"
  },
  {
    title: "Well-posed Learning Problem",
    text: "A learning problem is 'well-posed' when it clearly specifies:",
    options: [
      "Task (T), Performance measure (P), and Experience (E)",
      "Only the dataset size",
      "Only the programming language used",
      "Only the hardware specifications"
    ],
    correctAnswer: "Task (T), Performance measure (P), and Experience (E)"
  },
  {
    title: "Reinforcement Learning Signal",
    text: "What signal guides learning in Reinforcement Learning?",
    options: [
      "Labeled input-output pairs",
      "Cluster centroids",
      "Reward or penalty from the environment",
      "Feature correlation matrix"
    ],
    correctAnswer: "Reward or penalty from the environment"
  },
  {
    title: "Poor-quality Data Causes",
    text: "Which of the following is NOT a typical cause of poor-quality data?",
    options: [
      "Missing values",
      "Sensor/measurement errors",
      "Well-labeled, noise-free records",
      "Duplicate or inconsistent entries"
    ],
    correctAnswer: "Well-labeled, noise-free records"
  },
  {
    title: "Experience (E)",
    text: "For a spam-classification system, what does 'E' (Experience) represent?",
    options: [
      "The percentage of correctly classified emails",
      "The task of labeling emails as spam or not",
      "A dataset of emails already labeled as spam/not spam",
      "The email server hardware"
    ],
    correctAnswer: "A dataset of emails already labeled as spam/not spam"
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
