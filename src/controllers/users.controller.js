import { usersService } from "../services/index.js"
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAllUsers = async(req,res)=>{
    const users = await usersService.getAll();
    res.send({status:"success",payload:users})
}

const getUser = async(req,res)=> {
    const userId = req.params.uid;
    if(!isValidObjectId(userId)) return res.status(400).send({status:"error",error:"Invalid user ID format"})
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error",error:"User not found"})
    res.send({status:"success",payload:user})
}

const updateUser =async(req,res)=>{
    const updateBody = req.body;
    const userId = req.params.uid;
    if(!isValidObjectId(userId)) return res.status(400).send({status:"error",error:"Invalid user ID format"})
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error", error:"User not found"})
    const result = await usersService.update(userId,updateBody);
    res.send({status:"success",message:"User updated"})
}

const deleteUser = async(req,res) =>{
    const userId = req.params.uid;
    if(!isValidObjectId(userId)) return res.status(400).send({status:"error",error:"Invalid user ID format"})
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error", error:"User not found"})
    await usersService.delete(userId);
    res.send({status:"success",message:"User deleted"})
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
}