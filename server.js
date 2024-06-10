const mongoose=require('mongoose');
const dotenv=require('dotenv'); 
dotenv.config({ path: './config.env' });

const app=require('./app');

URL=process.env.URI.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(URL).then((con)=>{
    console.log('DB connection successful');
})


const port=process.env.PORT;
app.listen(port,()=>{
    console.log(`App listening on port ${port}`)
})