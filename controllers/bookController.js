const api = require("../middleware/api");

const getBestSellers = async(req,res)=>{
    const list= req.params.list;
    try{
        const data = await api.getBestSellers(list);
        res.json(data);
    }catch(error){
        res.status(500).json({message:'error fetching best sellers',error:error.message});
    }
}

const getBookDetails = async(req,res)=>{
    const isbn = req.params.isbn;
    console.log(isbn);
    try{
        const data = await api.getBookDetails(isbn);
        res.json(data);
    }catch(error){
        res.status(500).json({message:'Error fetching Book details'});
    }
}

const searchBooks =async(req,res)=>{
    const query = req.params.query;
    //console.log(query);
    try{
        const data = await api.searchBooks(query);
        //console.log(data);
        res.json(data);
    }catch(error){
        res.status(500).json({message:'Error searching books'});
    }
}

module.exports={
    getBestSellers,
    getBookDetails,
    searchBooks,
};