import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import connectDB from "./db/dbconnext.js";

dotenv.config({
    path:'../env'
});

connectDB();
