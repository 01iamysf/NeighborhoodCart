import React from 'react'
// import logo from '../assets/logo.png'

export default function About() {
  return (
    <div className="container-fluid p-5 text-center">
      
      {/* Logo / Image
      <img
        src={logo}
        alt="GrocBuket Logo"
        style={{ width: '150px', marginBottom: '20px' }}
      /> */}

      <h1>GrocBuket</h1>

      <p className="mt-3">
        GrocBuket is a web-based application designed
        to help businesses efficiently manage their products, stock levels,
        and inventory records. It allows users to add, update, view, and delete
        inventory items in real time.
      </p>

      <p>
        This system is built using the MERN stack (MongoDB, Express.js, React,
        and Node.js), providing a fast, scalable, and user-friendly experience
        for managing store data.
      </p>

    </div>
  )
}
