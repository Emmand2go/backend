import express from "express"
import { CreateStudents, deleteUser, forgotPassword, getAllStudents, getUserById, LoginUser, resetPassword, updateUser, VerifyUserEmail } from "../controller/user.js"
// import {protect} from "../authguard/authguard.js"
const router=express.Router()
router.post('/register',CreateStudents)
router.get('/', getAllStudents)
router.get('/:id',getUserById)
router.post('/login',LoginUser)
router.put('/update/:id',updateUser)
router.delete('/:id',deleteUser)
router.post("/verify-email", VerifyUserEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);





export default router