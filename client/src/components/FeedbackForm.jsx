import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

const FeedbackForm = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_xqf300o", // from EmailJS
        "template_t3wnora", // from EmailJS
        form.current,
        "z6Vb3-0wrZml-zPjj", // from EmailJS
      )
      .then(
        () => {
          toast.success("Feedback sent successfully!");
          form.current.reset();
        },
        () => {
          toast.error("Failed to send feedback.");
        },
      );
  };

  return (
    <section className="w-full  py-16 px-6 md:px-16">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Help Us Build the Right Product
          </h2>
          <p className="text-gray-600 mt-2">
            Tell us what problems you face and which features you would like us
            to add.
          </p>
        </div>

        {/* Form */}
        <form
          ref={form}
          onSubmit={sendEmail}
          className="bg-white p-8 rounded-xl shadow-sm space-y-6"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              type="email"
              name="user_email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Problem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What problem are you facing in managing your business?
            </label>
            <textarea
              name="problem"
              rows="3"
              required
              placeholder="Describe your problem..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Feature Request */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Which feature would you like us to add?
            </label>
            <textarea
              name="feature"
              rows="3"
              placeholder="Example: GST billing, WhatsApp reminders..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </section>
  );
};

export default FeedbackForm;
