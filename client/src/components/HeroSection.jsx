import React, { useState } from "react";
import heroImg from "../assets/Heroimg.png";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

const HeroSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        "service_xqf300o", // your service ID
        "template_u9j9ygp", // your template ID
        { email: email },
        "z6Vb3-0wrZml-zPjj", // your public key
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
    <section className="w-full flex items-center bg-black px-6 md:px-16 py-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="flex justify-center order-1 md:order-2">
          <img
            src={heroImg}
            alt="Business management dashboard"
            className="w-full max-w-2xl object-contain brightness-90"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-6 order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Simplify Your Business with Our
            <span className="text-gray-400">
              {" "}
              All-in-One Management Software
            </span>
          </h1>

          <p className="text-gray-300 text-lg">
            Manage customers, track sales, generate bills, and monitor payments
            — everything in one powerful platform.
          </p>

          {/* Email Form */}
          {/* <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full sm:w-72"
            />

            <button
              type="submit"
              className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              Join Waitlist
            </button>
          </form> */}

          {/* Waitlist Text */}
          <p className="text-sm text-gray-400 font-medium">
            Join our waitlist and be the first to try our software when it
            launches. Get early access and product updates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;