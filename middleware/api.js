const axios = require("axios");

const NYT_API_KEY = process.env.NYT_API_KEY;


const api ={
getBestSellers:async (list)=>{
    //const url =`https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${NYT_API_KEY}`
    //const url =`https://api.nytimes.com/svc/books/v3/lists/best-sellers.json?list=${list}`;
    const url =`https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${NYT_API_KEY}`
    // const headers ={
    //     'Authorization': `Bearer ${NYT_API_KEY}`,
    // }
    const response = await axios.get(url);
    return response.data;
},
getBookDetails: async(isbn)=>{
    console.log(isbn);
    const url= `https://api.nytimes.com/svc/books/v3/reviews.json?isbn=${isbn}&api-key=${NYT_API_KEY}`
    //const url = `https://api.nytimes.com/svc/books/v3/reviews.json?isbn=${isbn}&api-key=${NYT_API_KEY}`
    //const url = `https://api.nytimes.com/svc/books/v3/reviews.json?isbn=reviews.json?isbn=9781524763138&api-key=${NYT_API_KEY}`
    //const url =`https://api.nytimes.com/svc/books/v3/reviews.json?isbn=${isbn}`;
    // const headers = {
    //     'Authorization' : `Bearer ${NYT_API_KEY}`,
    // }
    const response = await axios.get(url);
    return response.data;
},
searchBooks: async(query)=>{
    const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${NYT_API_KEY}`
    //const url =`https://api.nytimes.com/svc/search/v2/articlesearch.json`;
    const response = await axios.get(url);
//    // try {
//         const response = await axios.get(url); // Await here
//         console.log("Response from NYT API:", response.data); // Log full response data
//         return response.data; // Return data correctly
//     // } catch (error) {
//     //     console.error("Error fetching articles:", error); // Log error details
//     //     throw error; // Rethrow to handle it in the calling function
//     // }
    return response.data;
}

}


module.exports = api;