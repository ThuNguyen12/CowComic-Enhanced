import React, { useState, useEffect } from 'react';
import axios from "axios"; // using axios for the API request
import '../css/survey.css';// CSS for styling
import logo from '../assets/cclogo.png';

import adventureIcon from '../assets/Genre Icons/adventure.png';
import biographyIcon from '../assets/Genre Icons/biography.png';
import comedyIcon from '../assets/Genre Icons/comedy.png';
import dramaIcon from '../assets/Genre Icons/drama.png';
import fantasyIcon from '../assets/Genre Icons/fantasy.png';
import fictionIcon from '../assets/Genre Icons/fiction.png';
import historicalIcon from '../assets/Genre Icons/historical.png';
import horrorIcon from '../assets/Genre Icons/horror.png';
import mysteryIcon from '../assets/Genre Icons/mystery.png';
import nonFictionIcon from '../assets/Genre Icons/non-fiction.png';
import romanceIcon from '../assets/Genre Icons/romance.png';
import scienceFictionIcon from '../assets/Genre Icons/sci-fi.png';
import crimeIcon from '../assets/Genre Icons/crime.png';
import psychologyIcon from '../assets/Genre Icons/psychological.png';
import satireIcon from '../assets/Genre Icons/satire.png';


const genreImages = {
  Adventure: adventureIcon,
  Biography: biographyIcon,
  Comedy: comedyIcon,
  Drama: dramaIcon,
  Fantasy: fantasyIcon,
  Fiction: fictionIcon,
  Historical: historicalIcon,
  Horror: horrorIcon,
  Mystery: mysteryIcon,
  'Non-Fiction': nonFictionIcon,
  Romance: romanceIcon,
  'Science-Fiction': scienceFictionIcon,
  Crime: crimeIcon,
  Psychology: psychologyIcon,
  Satire: satireIcon,
};

// this is the survey component for users to fill out their survey to get a book recommendation
// onSubmit is callback function used to pass recommendation to LoginHome.jsx
function Survey({ onSubmit }) {
  const [genres, setGenres] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [ageRating, setAgeRating] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 

  const handleGenreClick = (genre) => {
    setGenres(prevGenres =>
      prevGenres.includes(genre) ? prevGenres.filter(g => g !== genre) : [...prevGenres, genre]
    );
  };

  // Helper function to get genre icons based on 3 cases
  const getGenreIcons = () => {
    if (genres.length === 1) {
      return [genreImages[genres[0]]];
    } else if (genres.length > 1 && genres.length <= 3) {
      return genres.map(genre => genreImages[genre]);
    } else if (genres.length > 3) { // random imagine if more than 3 genres
      const shuffledGenres = genres.sort(() => Math.random() - 0.5);
      return shuffledGenres.slice(0, 3).map(genre => genreImages[genre]);
    }
    return [];
  };

  // Generate the prompt for the API
  const generatePrompt = () => {
    return `Recommend me a book with:
    - Genres: ${genres.join(', ')}
    - Keyword: "${keyword}"
    - Age Rating: "${ageRating}"
    - Publish Date: "${publishDate}"
    - Page Count: "${pageCount}"
  
    Respond in JSON format:
    {"title": "Book Title",
      "author": "Author Name",
      "ageRating": "Age Rating",
      "countryPublished": "Country Published",
      "summary": "A 2-3 sentence summary of the book"}`;
  };

  // Handles form submission and API request
  const handleSubmit = async () => {
    if (genres.length === 0 || !keyword || !ageRating || publishDate === '' || pageCount === '') {
      setError('Please fill out all fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
          // Send survey answers to our Python FastAPI backend
    const response = await axios.post(
      'http://127.0.0.1:8000/recommend',
      {
        genres,
        keyword,
        ageRating,
        publishDate,
        pageCount
      }
    );

    // Get the recommendation returned by FastAPI
    const book = response.data;

    // Display the recommendation
    setRecommendation(book);

    // Pass the recommendation to the parent component
    onSubmit(book);

    } catch (err) {
      setError('Error fetching the recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey-container">
      
      {/* Logo Section */}
      <div className="logo-container">
      <img src={logo} alt="Logo" className="logo" />
      </div>
      
      <h2 className="survey-title">Book Survey</h2>

      {/* Genres Section */}
      <label>Genres: </label>
      <div className="genres">

        {['Adventure', 'Biography', 'Comedy', 'Drama', 'Fantasy', 'Fiction', 'Historical', 'Horror',
        'Mystery', 'Non-Fiction', 'Romance', 'Science-Fiction','Crime','Psychology', 'Satire'].map((genre) => (
          <div
            key={genre}
            className={`genre-box ${genres.includes(genre) ? 'selected' : ''}`}
            onClick={() => handleGenreClick(genre)}
          >
            {genre}
          </div>
        ))}
      </div>

      {/* Keyword */}
      <label htmlFor="keyword">Keyword:</label>
      <input
        type="text"
        id="keyword"
        name="keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* Age Rating */}
      <div className="age-rating">
        <label>Age Rating:</label>
        {['5-12', '13-18', '18+', 'no-preference'].map((age) => (
          <label key={age}>
            <input
              type="radio"
              name="age-rating"
              value={age}
              onChange={(e) => setAgeRating(e.target.value)}
            /> {age === 'no-preference' ? 'No age preference' : `${age} year old`}
          </label>
        ))}
      </div>
      

      {/* Publish Date */}
      <label htmlFor="publish-date">Publish Date:</label>
      <select
        id="publish-date"
        name="publish-date"
        value={publishDate}
        onChange={(e) => setPublishDate(e.target.value)}
      >
        <option value="">Select a publish date</option> {/* Placeholder */}
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="older">Older</option>
      </select>

      {/* Page Count */}
      <label htmlFor="page-count">Page Count:</label>
      <select
        id="page-count"
        name="page-count"
        value={pageCount}
        onChange={(e) => setPageCount(e.target.value)}
      >
        <option value="">Select a page count</option> {/* Placeholder */}
        <option value="less-100">&lt; 100 pages</option>
        <option value="100-300">100 - 300 pages</option>
        <option value="300+">&gt; 300 pages</option>
      </select>

      {/* Submit Button */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {error && <p className="error-message">{error}</p>}

      {/* Genre Icons Section - Separate from Recommendation */}
      
      <div className="genre-icons">
        {getGenreIcons().map((icon, index) => (
          <img key={index} src={icon} alt="Genre Icon" className="genre-icon" />
        ))}
      </div>

      {recommendation && (
        <div className="recommendation-message">
        <h3>Recommended Book:</h3>
        <p><strong>Title:</strong> {recommendation.title}</p>
        <p><strong>Author:</strong> {recommendation.author}</p>
        <p><strong>Age Rating:</strong> {recommendation.ageRating}</p>
        <p><strong>Country Published:</strong> {recommendation.countryPublished}</p>
        <p><strong>Summary:</strong> {recommendation.summary}</p>
      </div>
    )}
    </div>
  );
}

export default Survey;
