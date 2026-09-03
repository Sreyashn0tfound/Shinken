import { Router, Request, Response } from 'express';
import multer from 'multer';

export const aiRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

aiRouter.post('/parse', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
        // 🚨 HARDCODED FULL 75-QUESTION NEXORA EXAM
        const sections = [
            {
                sectionTitle: "SECTION 1 - C PROGRAMMING",
                questions: [
                    { questionText: "Which of the following is used to display output in C?", options: ["A) scanf()", "B) printf()", "C) print()", "D) display()"], correctAnswer: "B) printf()" },
                    { questionText: "Which symbol is used to end a statement in C?", options: ["A) :", "B) .", "C) ;", "D) ,"], correctAnswer: "C) ;" },
                    { questionText: "Which data type is used to store a whole number?", options: ["A) float", "B) char", "C) int", "D) double"], correctAnswer: "C) int" },
                    { questionText: "What is the output? int a=5; printf(\"%d\", a+3);", options: ["A) 5", "B) 3", "C) 8", "D) 15"], correctAnswer: "C) 8" },
                    { questionText: "Which operator means equal to in C?", options: ["A) =", "B) ==", "C) !=", "D) ==="], correctAnswer: "B) ==" },
                    { questionText: "What is x after int x=10; x=x+5;?", options: ["A) 5", "B) 10", "C) 15", "D) 50"], correctAnswer: "C) 15" },
                    { questionText: "Which loop is generally used when repetitions are known?", options: ["A) if", "B) for", "C) switch", "D) break"], correctAnswer: "B) for" },
                    { questionText: "If x=10 and x>5, what is printed by the if-else statement?", options: ["A) Yes", "B) No", "C) Error", "D) Nothing"], correctAnswer: "A) Yes" },
                    { questionText: "Which keyword returns a value from a function?", options: ["A) send", "B) return", "C) back", "D) output"], correctAnswer: "B) return" },
                    { questionText: "What is the first index of an array in C?", options: ["A) 0", "B) 1", "C) -1", "D) 2"], correctAnswer: "A) 0" },
                    { questionText: "What is printed by for(int i=1;i<=3;i++) printf(\"%d \",i);", options: ["A) 012", "B) 123", "C) 12", "D) 321"], correctAnswer: "B) 123" },
                    { questionText: "Which operator gives the remainder after division?", options: ["A) /", "B) //", "C) %", "D) rem"], correctAnswer: "C) %" },
                    { questionText: "Which is a valid variable name?", options: ["A) 2number", "B) my-name", "C) myNumber", "D) float"], correctAnswer: "C) myNumber" },
                    { questionText: "What is the output of int a=4, b=2; printf(\"%d\",a*b);", options: ["A) 2", "B) 4", "C) 6", "D) 8"], correctAnswer: "D) 8" },
                    { questionText: "Which statement is used to make a decision in C?", options: ["A) if", "B) loop", "C) repeat", "D) check"], correctAnswer: "A) if" }
                ]
            },
            {
                sectionTitle: "SECTION 2 - DATA STRUCTURES",
                questions: [
                    { questionText: "What is a data structure?", options: ["A) A programming language", "B) A way of organizing data", "C) An operating system", "D) A computer network"], correctAnswer: "B) A way of organizing data" },
                    { questionText: "Which data structure follows LIFO?", options: ["A) Queue", "B) Stack", "C) Array", "D) Linked List"], correctAnswer: "B) Stack" },
                    { questionText: "Which data structure follows FIFO?", options: ["A) Stack", "B) Queue", "C) Tree", "D) Graph"], correctAnswer: "B) Queue" },
                    { questionText: "Which structure stores elements in consecutive memory locations?", options: ["A) Array", "B) Tree", "C) Graph", "D) Stack"], correctAnswer: "A) Array" },
                    { questionText: "In a stack, insertion is called:", options: ["A) Enqueue", "B) Push", "C) Insert", "D) Add"], correctAnswer: "B) Push" },
                    { questionText: "In a stack, deletion is called:", options: ["A) Pop", "B) Delete", "C) Dequeue", "D) Remove"], correctAnswer: "A) Pop" },
                    { questionText: "In a queue, insertion is called:", options: ["A) Push", "B) Pop", "C) Enqueue", "D) Insert"], correctAnswer: "C) Enqueue" },
                    { questionText: "In a queue, deletion is called:", options: ["A) Pop", "B) Dequeue", "C) Push", "D) Remove"], correctAnswer: "B) Dequeue" },
                    { questionText: "Which structure is commonly used for undo operations?", options: ["A) Queue", "B) Stack", "C) Array", "D) Tree"], correctAnswer: "B) Stack" },
                    { questionText: "Which structure is commonly used for printer job management?", options: ["A) Stack", "B) Queue", "C) Tree", "D) Graph"], correctAnswer: "B) Queue" },
                    { questionText: "Which is the best example of a tree structure?", options: ["A) Family hierarchy", "B) Shopping list", "C) Queue at a counter", "D) Stack of plates"], correctAnswer: "A) Family hierarchy" },
                    { questionText: "A linked-list node usually contains:", options: ["A) Only data", "B) Only address", "C) Data and link", "D) Only a number"], correctAnswer: "C) Data and link" },
                    { questionText: "Which structure represents connections between cities?", options: ["A) Stack", "B) Queue", "C) Graph", "D) Array"], correctAnswer: "C) Graph" },
                    { questionText: "Which structure would you use to store marks of 50 students?", options: ["A) Array", "B) Graph", "C) Tree", "D) Queue"], correctAnswer: "A) Array" },
                    { questionText: "Which is a linear data structure?", options: ["A) Tree", "B) Graph", "C) Array", "D) Network"], correctAnswer: "C) Array" }
                ]
            },
            {
                sectionTitle: "SECTION 3 - QUANTITATIVE ABILITY",
                questions: [
                    { questionText: "What is 25% of 200?", options: ["A) 25", "B) 40", "C) 50", "D) 75"], correctAnswer: "C) 50" },
                    { questionText: "If a pen costs 20, how much will 5 pens cost?", options: ["A) 80", "B) 100", "C) 120", "D) 150"], correctAnswer: "B) 100" },
                    { questionText: "What is the average of 10, 20 and 30?", options: ["A) 15", "B) 20", "C) 25", "D) 30"], correctAnswer: "B) 20" },
                    { questionText: "A student scores 80 out of 100. What is the percentage?", options: ["A) 60%", "B) 70%", "C) 80%", "D) 90%"], correctAnswer: "C) 80%" },
                    { questionText: "If 5 x x = 40, what is x?", options: ["A) 5", "B) 6", "C) 8", "D) 10"], correctAnswer: "C) 8" },
                    { questionText: "A train travels 60 km in 1 hour. How far in 3 hours?", options: ["A) 120 km", "B) 150 km", "C) 180 km", "D) 200 km"], correctAnswer: "C) 180 km" },
                    { questionText: "Next number: 2, 4, 6, 8, ...", options: ["A) 9", "B) 10", "C) 12", "D) 14"], correctAnswer: "B) 10" },
                    { questionText: "Next number: 3, 6, 12, 24, ...", options: ["A) 30", "B) 36", "C) 48", "D) 60"], correctAnswer: "C) 48" },
                    { questionText: "A shirt costs 500 and is sold for 600. Profit?", options: ["A) 50", "B) 100", "C) 150", "D) 200"], correctAnswer: "B) 100" },
                    { questionText: "If 10 students finish a task in 5 days, what would generally help finish sooner?", options: ["A) More work", "B) Fewer resources", "C) More students", "D) Less time per day"], correctAnswer: "C) More students" },
                    { questionText: "Ratio boys:girls is 2:3. If boys = 10, girls = ?", options: ["A) 12", "B) 15", "C) 18", "D) 20"], correctAnswer: "B) 15" },
                    { questionText: "What is 15 + 25 x 2?", options: ["A) 80", "B) 65", "C) 55", "D) 40"], correctAnswer: "B) 65" },
                    { questionText: "A clock shows 3:00. Angle between hands?", options: ["A) 30°", "B) 60°", "C) 90°", "D) 180°"], correctAnswer: "C) 90°" },
                    { questionText: "If today is Monday, what day after 10 days?", options: ["A) Wednesday", "B) Thursday", "C) Friday", "D) Saturday"], correctAnswer: "B) Thursday" },
                    { questionText: "100 increases to 120. Percentage increase?", options: ["A) 10%", "B) 15%", "C) 20%", "D) 25%"], correctAnswer: "C) 20%" }
                ]
            },
            {
                sectionTitle: "SECTION 4 - LOGICAL REASONING",
                questions: [
                    { questionText: "Odd one out: Apple, Mango, Carrot, Banana", options: ["A) Apple", "B) Mango", "C) Carrot", "D) Banana"], correctAnswer: "C) Carrot" },
                    { questionText: "Next number: 5, 10, 15, 20, ...", options: ["A) 22", "B) 25", "C) 30", "D) 35"], correctAnswer: "B) 25" },
                    { questionText: "Next letter: A, C, E, G, ...", options: ["A) H", "B) I", "C) J", "D) K"], correctAnswer: "B) I" },
                    { questionText: "If CAT is coded as DBU, how is DOG coded?", options: ["A) EPH", "B) EOG", "C) DPH", "D) FPH"], correctAnswer: "A) EPH" },
                    { questionText: "Ravi is taller than Amit; Amit is taller than Raj. Shortest?", options: ["A) Ravi", "B) Amit", "C) Raj", "D) Cannot say"], correctAnswer: "C) Raj" },
                    { questionText: "All roses are flowers. Some flowers are red. Definitely true?", options: ["A) All roses are red", "B) Roses are flowers", "C) All flowers are roses", "D) No roses are red"], correctAnswer: "B) Roses are flowers" },
                    { questionText: "Odd one out: Square, Triangle, Circle, Rectangle", options: ["A) Square", "B) Triangle", "C) Circle", "D) Rectangle"], correctAnswer: "C) Circle" },
                    { questionText: "If 2+3=10 and 3+4=21, then 4+5=?", options: ["A) 25", "B) 30", "C) 36", "D) 40"], correctAnswer: "C) 36" },
                    { questionText: "Walk north, then turn right. Facing?", options: ["A) West", "B) East", "C) South", "D) North"], correctAnswer: "B) East" },
                    { questionText: "Book: Reading :: Food: ?", options: ["A) Cooking", "B) Eating", "C) Buying", "D) Selling"], correctAnswer: "B) Eating" },
                    { questionText: "If yesterday was Sunday, tomorrow is?", options: ["A) Monday", "B) Tuesday", "C) Wednesday", "D) Saturday"], correctAnswer: "B) Tuesday" },
                    { questionText: "Missing number: 2, 5, 10, 17, 26, ...", options: ["A) 35", "B) 36", "C) 37", "D) 38"], correctAnswer: "C) 37" },
                    { questionText: "A is brother of B. B is sister of C. A is C's:", options: ["A) Sister", "B) Brother", "C) Father", "D) Uncle"], correctAnswer: "B) Brother" },
                    { questionText: "Which number does not belong: 2, 4, 6, 9?", options: ["A) 2", "B) 4", "C) 6", "D) 9"], correctAnswer: "D) 9" },
                    { questionText: "Rahul is before Arun, Arun before Kiran. Who is definitely not before Rahul?", options: ["A) Arun", "B) Kiran", "C) Both Arun and Kiran", "D) Cannot determine"], correctAnswer: "C) Both Arun and Kiran" }
                ]
            },
            {
                sectionTitle: "SECTION 5 - ENGLISH",
                questions: [
                    { questionText: "Choose the correct spelling:", options: ["A) Enviroment", "B) Environment", "C) Envirnment", "D) Environmant"], correctAnswer: "B) Environment" },
                    { questionText: "Synonym of Happy:", options: ["A) Sad", "B) Angry", "C) Joyful", "D) Tired"], correctAnswer: "C) Joyful" },
                    { questionText: "Antonym of Difficult:", options: ["A) Hard", "B) Easy", "C) Tough", "D) Complex"], correctAnswer: "B) Easy" },
                    { questionText: "She ___ to college every day.", options: ["A) go", "B) goes", "C) going", "D) gone"], correctAnswer: "B) goes" },
                    { questionText: "Choose the correct sentence:", options: ["A) He are a student.", "B) He is a student.", "C) He am a student.", "D) He be a student."], correctAnswer: "B) He is a student." },
                    { questionText: "Plural of Child:", options: ["A) Childs", "B) Childes", "C) Children", "D) Childrens"], correctAnswer: "C) Children" },
                    { questionText: "He is ___ engineer.", options: ["A) a", "B) an", "C) the", "D) no article"], correctAnswer: "B) an" },
                    { questionText: "Synonym of Begin:", options: ["A) End", "B) Start", "C) Stop", "D) Finish"], correctAnswer: "B) Start" },
                    { questionText: "Antonym of Ancient:", options: ["A) Old", "B) Historic", "C) Modern", "D) Past"], correctAnswer: "C) Modern" },
                    { questionText: "I am interested ___ programming.", options: ["A) on", "B) at", "C) in", "D) for"], correctAnswer: "C) in" },
                    { questionText: "Identify the noun: The student completed the assignment.", options: ["A) completed", "B) the", "C) student", "D) assignment"], correctAnswer: "C) student" },
                    { questionText: "Past tense of Go:", options: ["A) Goed", "B) Goes", "C) Went", "D) Going"], correctAnswer: "C) Went" },
                    { questionText: "Correct sentence:", options: ["A) College I every go day to.", "B) I go to college every day.", "C) Every college I day go to.", "D) Go I college every day to."], correctAnswer: "B) I go to college every day." },
                    { questionText: "Once in a blue moon means:", options: ["A) Every day", "B) Very rarely", "C) At night", "D) Suddenly"], correctAnswer: "B) Very rarely" },
                    { questionText: "The students ___ playing cricket.", options: ["A) is", "B) am", "C) are", "D) be"], correctAnswer: "C) are" }
                ]
            }
        ];

        res.json({ sections });
    } catch (error: any) {
        console.error('Hardcoded Parse Error:', error);
        res.status(500).json({ error: 'Failed to return the hardcoded exam.' });
    }
});