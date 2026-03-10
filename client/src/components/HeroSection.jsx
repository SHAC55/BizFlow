import React, { useState } from "react";
import heroImg from "../assets/Heroimg.png";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

const HeroSection = () => {

  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs.send(
      "service_xqf300o",      // your service ID
      "template_u9j9ygp",     // your template ID
      { email: email },
      "z6Vb3-0wrZml-zPjj"    // your public key
    )
    .then(() => {
     toast.success("You're on the waitlist 🚀");
      setEmail("");
    })
    .catch((error) => {
      // console.log(error);
      toast.error("Oops, something went wrong. Please try again.");
    });
  };

  return (
    <section className="w-full flex items-center bg-white px-6 md:px-16 py-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Image */}
        <div className="flex justify-center order-1 md:order-2">
          <img
            src={heroImg}
            alt="Business management dashboard"
            className="w-full max-w-2xl object-contain"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-6 order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Simplify Your Business with Our
            <span className="text-blue-600">
              {" "}All-in-One Management Software
            </span>
          </h1>

          <p className="text-gray-600 text-lg">
            Manage customers, track sales, generate bills, and monitor payments —
            everything in one powerful platform.
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
            />

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Join Waitlist
            </button>
          </form>

          {/* Waitlist Text */}
          <p className="text-sm text-gray-500 font-medium">
            Join our waitlist and be the first to try our software when it
            launches. Get early access and product updates.
          </p>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;