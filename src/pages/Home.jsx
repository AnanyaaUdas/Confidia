import React from "react";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import Stats from "../components/Stats"
import Wall from "../components/Wall";
import ProfilePage from "../components/ProfilePage";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <NavBar />

      <div className="home">
        <Hero />
        <Stats />
        <Wall />
        <ProfilePage />
      
        
      </div>
      <Footer />
    </>
  );
};

export default Home;