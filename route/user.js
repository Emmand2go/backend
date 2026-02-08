import express from "express"
import { CreateStudents, deleteUser, getAllStudents, getUserById, LoginUser, updateUser, VerifyUserEmail } from "../controller/user.js"
// import {protect} from "../authguard/authguard.js"
const router=express.Router()
router.post('/register',CreateStudents)
router.get('/', getAllStudents)
router.get('/:id',getUserById)
router.post('/login',LoginUser)
router.put('/update/:id',updateUser)
router.delete('/:id',deleteUser)
router.post("/verify-email", VerifyUserEmail);





export default router