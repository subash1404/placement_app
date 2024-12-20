import styles from "./loginPage.module.css";
import Nav from "../../components/common/Nav";
import CustomTextInput from "../../components/common/CustomTextInput";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import loginAPI from "../../apis/common/loginAPI";
import {updateUserDetails} from "../../store/authSlice";
import {toast} from "react-toastify";
import {useDispatch} from "react-redux";
import nav from "../../components/common/Nav";
import getCoursesAPI from "../../apis/student/getCoursesAPI";
import {updateCourses} from "../../store/coursesSlice";
import forgetPasswordAPI from "../../apis/common/forgetPasswordAPI";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isForgetPasswordLoading, setIsForgetPasswordLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("jwtToken")) {
            if (localStorage.getItem("role") === "student") navigate("/student/home")
            if (localStorage.getItem("role") === "admin") navigate("/admin/home")
        }
        const captureEnterKey = (event) => {
            if (event.key === "Enter") {
                authenticate();
            }
        }
        document.addEventListener("keydown", captureEnterKey);
        return () => {
            document.removeEventListener("keydown", captureEnterKey);
        };
    }, [username, password]);

    const authenticate = async () => {
        try {
            setIsLoading(true);
            let response = await loginAPI(username, password);
            dispatch(updateUserDetails(response.data));
            toast("Authentication Successful", {type: "success"})
            localStorage.setItem("jwtToken", response.data.jwtToken)
            localStorage.setItem("role", response.data.role)
            localStorage.setItem("userId", response.data.userId)
            localStorage.setItem("username", response.data.name)
            localStorage.setItem("email", response.data.email)
            if (localStorage.getItem("role") === "student") {
                response = await getCoursesAPI()
                dispatch(updateCourses(response.data));
            }
            navigate("/student/home")
        } catch (e) {
            console.log(e)
            toast("Authentication Error", {type: "error"})
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className={styles.loginPage}>
            <div className={styles.content}>
                <div className={styles.formContainer}>
                    <h1 className={styles.loginText}>Login</h1>
                    <CustomTextInput
                        placeholder="Username"
                        value={username}
                        onChange={setUsername}
                    />
                    <CustomTextInput
                        placeholder="Password"
                        value={password}
                        onChange={setPassword}
                    />
                    <div className={styles.loginButton}
                         onClick={isLoading ? () => {
                         } : authenticate}
                    >{isLoading ? "Loading..." : "Submit"}</div>
                    <p className={styles.forgetPassword} onClick={async () => {
                        try {
                            if (username === undefined || username === null || username.trim().length === 0) {
                                toast("Please enter your email", {type: "warning"})
                                return;
                            }
                            setIsForgetPasswordLoading(true)
                            const response = await forgetPasswordAPI(username)
                            toast(response.data.message, {type: "success"});
                        } catch (e) {
                            toast(e.data.message, {type: "error"});
                        } finally {
                            setIsForgetPasswordLoading(false)
                        }
                    }}>Forget Password</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
