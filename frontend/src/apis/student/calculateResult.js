import axios from "axios";

const calculateResultAPI = async (courseId, sectionNo) => {
    try {
        return await axios.post(process.env.REACT_APP_BACKEND_URI + "/quiz/calculate-result", {
                courseId,
                sectionNo: parseInt(sectionNo) + 1,
                userId: localStorage.getItem("userId"),
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}` // Send JWT as Bearer token
                }
            })
    } catch (e) {
        console.log("ERROR: Calculate result API")
        throw e;
    }
}

export default calculateResultAPI;