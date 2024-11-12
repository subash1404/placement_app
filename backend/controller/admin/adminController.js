const express = require("express");
const router = express.Router();
const User = require("../../model/userModel");
const Enrollment = require("../../model/enrollmentModel");
const Course = require("../../model/courseModel")

router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/enrolledStudents/:courseId", async (req, res) => {
  try { 
    const { courseId } = req.params
    const course = await Course.findOne({ courseId });
    const enrolledStudents = await Enrollment.find({ course: course._id });
    return res.status(200).json({ enrolledStudents });
  } catch (error) {
    res.status(500).json({ "message": "Internal Server Error", e });
  }
});

router.get('/certificates-obtained/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params
    const enrollments = await Enrollment.find({
      "section": {
        $elemMatch: {
          isFinal: true,
          isCompleted: true
        }
      }
    }).populate('user');
    const result = enrollments.map(enrollment => ({
      enrollment,
      user: enrollment.user
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get("/attempt-requests/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params
    const enrollments = await Enrollment.find({
      section: { $elemMatch: { isFinal: true } },
    })
      .populate("user", "-password")
      .populate("course", "courseName");

    const response = enrollments.flatMap((enrollment) => {
      return enrollment.section
        .filter(
          (section) =>
            section.isFinal &&
            section.noOfAttempts >= enrollment.finalQuizAllowReattemptCount * 2
        )
        .map((section) => ({
          noOfAttempts: section.noOfAttempts,
          user: enrollment.user,
          courseName: enrollment.course.courseName,
        }));
    });

    return res.json(response);
  } catch (error) {
    console.error("Error fetching attempt requests:", error);
    res.status(500).json({ message: "Server error fetching attempt requests" });
  }
});

router.post("/allow-reattempt", async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const course = await Course.findOne({ courseId });      
    const enrollment = await Enrollment.findOne({ user: userId, course: course._id });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.finalQuizAllowReattemptCount += 1

    await enrollment.save();

    return res.json({ message: "Reattempt allowed successfully", enrollment });
  } catch (error) {
    console.error("Error allowing reattempt:", error);
    res.status(500).json({ message: "Server error allowing reattempt" });
  }
});

router.post("/restart-course", async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const course = await Course.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: course._id,
    });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.section = enrollment.section.map((section) => {
      const quizDefaults = course.quiz.find(
        (quiz) => quiz.sectionNo === section.sectionNo
      );

      return {
        sectionNo: section.sectionNo,
        isCompleted: false,
        noOfAttempts: quizDefaults ? 0 : undefined,
        reattemptIn: quizDefaults ? null : undefined,
        timeTaken: quizDefaults ? null : undefined,
        isFinal: section.isFinal || false,
      };
    });

    enrollment.finalQuizAllowReattemptCount = 1;

    await enrollment.save();

    return res.json({
      message: "Course restarted successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Error restarting course:", error);
    return res.status(500).json({ message: "Server error restarting course" });
  }
});

module.exports = router;
