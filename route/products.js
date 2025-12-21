import express from "express";
import { createProduct, getAllProducts, getProductById, updateProducts } from "../controller/products.js";


const PRouter=express.Router();
PRouter.post('/',createProduct)
PRouter.get('/:id',getProductById)
PRouter.get('/',getAllProducts)
PRouter.put('/update/:id',updateProducts)

export default PRouter