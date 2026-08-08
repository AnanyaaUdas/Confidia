import React from "react";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import Stats from "../components/Stats"
import Wall from "../components/Wall";

const Home = () => {
  return (
    <>
      <NavBar />

      <div className="home">
        <Hero />
        <Stats />
        <Wall />
        
      </div>
    </>
  );
};

export default Home;