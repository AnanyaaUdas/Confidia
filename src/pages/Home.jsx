import React from "react";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import Stats from "../components/Stats"
import Wall from "../components/Wall";
import Profile from "../components/Profile";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <NavBar />

      <div className="home">
        <Hero />
        <Stats />
        <Wall />
        <Profile />
      
        
      </div>
      <Footer />
    </>
  );
};

export default Home;