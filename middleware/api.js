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

    searchBooks: async (query) => {
        const url = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${NYT_API_KEY}`;
        try {
            const response = await axios.get(url);
            const books = response.data.results.books;

            // Filter books based on the query matching title or author
            const filteredBooks = books.filter(book => 
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase())
            );

            return filteredBooks;
        } catch (error) {
            console.error('Error fetching books:', error); // Log error details
            throw error;
        }
    }







}


module.exports = api;