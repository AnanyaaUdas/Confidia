import React from "react";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";

const Home = () => {
  return (
    <>
      <NavBar />

      <div className="home">
        <Hero />
      </div>
    </>
  );
};

export default Home;