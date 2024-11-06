import axios from "axios";

const registerSessionAPI = async (courseId, sectionNo, isFinal) => {
    try {
        return await axios.post("http://localhost:3000" + "/quiz/new-questions", {
            courseId,
            sectionNo: parseInt(sectionNo) + 1,
            userId: "671598ea1aa659de63af9c64",
            isFinal
        },
            {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}` // Send JWT as Bearer token
            }
        })
    } catch (e) {
        console.log("ERROR: Register session API")
        throw e;
    }
}

export default registerSessionAPI;