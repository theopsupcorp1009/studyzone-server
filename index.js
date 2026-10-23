import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const client = new MongoClient(process.env.MONGODB_URL);

export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.dir(err);
    }
}

const mongoClient = await connectToMongoDB();
const db = mongoClient.db('students-db');
const studentCollection = db.collection('students');
const subjectCollection = db.collection('subjects');

app.post('/subjects', async (req, res) => {
    try {
        const { subjectCode, subjectName, description, duration } = req.body;

        if (
            typeof subjectCode !== 'string' ||
            !subjectCode.trim() ||
            typeof subjectName !== 'string' ||
            !subjectName.trim()
        ) {
            return res.status(400).send({
                message: "Subject code and subject name are required."
            });
        }

        const normalizedCode = subjectCode.trim().toUpperCase();
        const normalizedName = subjectName.trim();

        if (
            normalizedCode.length < 2 ||
            normalizedCode.length > 20 ||
            !/^[A-Z0-9-]+$/.test(normalizedCode)
        ) {
            return res.status(400).send({
                message: "Subject code must contain 2–20 letters, numbers, or hyphens."
            });
        }

        if (normalizedName.length < 2 || normalizedName.length > 100) {
            return res.status(400).send({
                message: "Subject name must contain 2–100 characters."
            });
        }

        if (
            (description !== undefined && typeof description !== 'string') ||
            (duration !== undefined && typeof duration !== 'string')
        ) {
            return res.status(400).send({
                message: "Description and duration must be text."
            });
        }

        if (
            (description || '').length > 1000 ||
            (duration || '').length > 50
        ) {
            return res.status(400).send({
                message: "Description or duration exceeds the allowed length."
            });
        }

        const existingSubject = await subjectCollection.findOne({
            subjectCode: normalizedCode
        });

        if (existingSubject) {
            return res.status(409).send({
                message: "Subject code already exists."
            });
        }

        const data = {
            subjectCode: normalizedCode,
            subjectName: normalizedName,
            description: (description || '').trim(),
            duration: (duration || '').trim()
        };

        const result = await subjectCollection.insertOne(data);

        return res.status(201).send({
            message: "Subject added successfully.",
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error("Subject creation error:", error);
        return res.status(500).send({
            message: "Internal server error."
        });
    }
});

app.get('/subjects', async (req, res) => {
    const result = await subjectCollection.find().toArray();
    res.send(result);
})

app.patch('/subjects/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid subject ID."
            });
        }

        const { subjectCode, subjectName, description, duration } = req.body;

        if (
            typeof subjectCode !== 'string' ||
            !subjectCode.trim() ||
            typeof subjectName !== 'string' ||
            !subjectName.trim()
        ) {
            return res.status(400).send({
                message: "Subject code and subject name are required."
            });
        }

        const normalizedCode = subjectCode.trim().toUpperCase();
        const normalizedName = subjectName.trim();

        if (
            normalizedCode.length < 2 ||
            normalizedCode.length > 20 ||
            !/^[A-Z0-9-]+$/.test(normalizedCode)
        ) {
            return res.status(400).send({
                message: "Subject code must contain 2–20 letters, numbers, or hyphens."
            });
        }

        if (normalizedName.length < 2 || normalizedName.length > 100) {
            return res.status(400).send({
                message: "Subject name must contain 2–100 characters."
            });
        }

        if (
            (description !== undefined && typeof description !== 'string') ||
            (duration !== undefined && typeof duration !== 'string')
        ) {
            return res.status(400).send({
                message: "Description and duration must be text."
            });
        }

        if (
            (description || '').length > 1000 ||
            (duration || '').length > 50
        ) {
            return res.status(400).send({
                message: "Description or duration exceeds the allowed length."
            });
        }

        const subjectObjectId = new ObjectId(id);

        const currentSubject = await subjectCollection.findOne({
            _id: subjectObjectId
        });

        if (!currentSubject) {
            return res.status(404).send({
                message: "Subject not found."
            });
        }

        const duplicateSubject = await subjectCollection.findOne({
            _id: { $ne: subjectObjectId },
            subjectCode: normalizedCode
        });

        if (duplicateSubject) {
            return res.status(409).send({
                message: "Subject code already exists."
            });
        }

        const updatedData = {
            subjectCode: normalizedCode,
            subjectName: normalizedName,
            description: (description || '').trim(),
            duration: (duration || '').trim()
        };

        const result = await subjectCollection.updateOne(
            { _id: subjectObjectId },
            { $set: updatedData }
        );

        return res.status(200).send({
            message: "Subject updated successfully.",
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Subject update error:", error);
        return res.status(500).send({
            message: "Internal server error."
        });
    }
});

app.get('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    const result = await subjectCollection.findOne({ _id: new ObjectId(id) });
    res.send(result);
})

app.delete('/subjects/:id', async (req, res) => {
    const { id } = req.params;
    const result = await subjectCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
})

app.post('/students', async (req, res) => {
    try {
        const { studentId, name, email, phone, course, date } = req.body;

        if (![studentId, name, email, phone, date].every(
            value => typeof value === 'string' && value.trim()
        )) {
            return res.status(400).send({
                message: "Student ID, name, email, phone, and date are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).send({
                message: "Please enter a valid email address, such as student@gmail.com."
            });
        }

        const normalizedPhone = phone.trim();
        const phonePattern = /^\+?[0-9\s()-]{7,20}$/;
        const digitCount = normalizedPhone.replace(/\D/g, '').length;

        if (
            !phonePattern.test(normalizedPhone) ||
            digitCount < 7 ||
            digitCount > 15
        ) {
            return res.status(400).send({
                message: "Please enter a valid phone number."
            });
        }

        const normalizedStudentId = studentId.trim();

        const existingStudent = await studentCollection.findOne({
            $or: [
                { studentId: normalizedStudentId },
                { email: normalizedEmail }
            ]
        });

        if (existingStudent) {
            return res.status(409).send({
                message: existingStudent.studentId === normalizedStudentId
                    ? "Student ID already exists."
                    : "Email address already exists."
            });
        }

        const data = {
            studentId: normalizedStudentId,
            name: name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            course: typeof course === 'string' ? course.trim() : '',
            date: date.trim()
        };

        const result = await studentCollection.insertOne(data);

        return res.status(201).send({
            message: "Student registered successfully.",
            insertedId: result.insertedId
        });

    } catch (error) {
        console.error("Student registration error:", error);

        return res.status(500).send({
            message: "Internal server error."
        });
    }
});


app.get('/students', async (req, res) => {
    const result = await studentCollection.find().toArray();
    res.send(result);
})

app.get('/', async (req, res) => {
    res.send({ msg: "Server Running Fine" })
})


app.patch('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid student ID."
            });
        }

        const { studentId, name, email, phone, course, date } = req.body;

        if (![studentId, name, email, phone, date].every(
            value => typeof value === 'string' && value.trim()
        )) {
            return res.status(400).send({
                message: "Student ID, name, email, phone, and date are required."
            });
        }

        const normalizedStudentId = studentId.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = phone.trim();

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).send({
                message: "Please enter a valid email address, such as student@gmail.com."
            });
        }

        const phonePattern = /^\+?[0-9\s()-]{7,20}$/;
        const digitCount = normalizedPhone.replace(/\D/g, '').length;

        if (
            !phonePattern.test(normalizedPhone) ||
            digitCount < 7 ||
            digitCount > 15
        ) {
            return res.status(400).send({
                message: "Please enter a valid phone number."
            });
        }

        const existingStudent = await studentCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!existingStudent) {
            return res.status(404).send({
                message: "Student not found."
            });
        }

        const duplicateStudent = await studentCollection.findOne({
            _id: { $ne: new ObjectId(id) },
            $or: [
                { studentId: normalizedStudentId },
                { email: normalizedEmail }
            ]
        });

        if (duplicateStudent) {
            return res.status(409).send({
                message: duplicateStudent.studentId === normalizedStudentId
                    ? "Student ID already exists."
                    : "Email address already exists."
            });
        }

        const updatedData = {
            studentId: normalizedStudentId,
            name: name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            course: typeof course === 'string' ? course.trim() : '',
            date: date.trim()
        };

        const result = await studentCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );

        return res.status(200).send({
            message: "Student updated successfully.",
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Student update error:", error);

        return res.status(500).send({
            message: "Internal server error."
        });
    }
});


app.get('/students/:id', async (req, res) => {
    const { id } = req.params;
    const result = await studentCollection.findOne({ _id: new ObjectId(id) });
    res.send(result);
})

app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    const result = await studentCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
})

app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`)
})