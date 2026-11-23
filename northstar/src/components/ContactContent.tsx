"use client";

import { useState } from 'react';

export default function ContactContent({ content }: { content: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!content) return null;

  const infoTitle = content.info?.title ?? 'Contact Information';
  const addressLabel = content.info?.addressLabel ?? 'Address';
  const emailLabel = content.info?.emailLabel ?? 'Email';
  const phoneLabel = content.info?.phoneLabel ?? 'Phone';

  const nameLabel = content.form?.nameLabel ?? 'Name';
  const namePlaceholder = content.form?.namePlaceholder ?? 'Jane Doe';
  const emailFieldLabel = content.form?.emailLabel ?? 'Email';
  const emailPlaceholder = content.form?.emailPlaceholder ?? 'jane@example.com';
  const messageLabel = content.form?.messageLabel ?? 'Message';
  const messagePlaceholder = content.form?.messagePlaceholder ?? 'How can we help you?';
  const successMessage =
    content.form?.successMessage ??
    'Thank you! Your message has been received. We will get back to you shortly.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <main data-editor-page="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24" data-editor-section="header">
          <h1
            className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6"
            data-editor-page="contact"
            data-editor-field="title"
            data-editor-path="header.title"
            data-editor-type="text"
          >
            {content.header?.title}
          </h1>
          <p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            data-editor-page="contact"
            data-editor-field="description"
            data-editor-path="header.description"
            data-editor-type="textarea"
          >
            {content.header?.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div data-editor-section="info">
            <h2
              className="text-2xl font-bold text-gray-900 mb-8"
              data-editor-page="contact"
              data-editor-field="title"
              data-editor-path="info.title"
              data-editor-type="text"
            >
              {infoTitle}
            </h2>
            <div className="space-y-6 text-lg text-gray-600">
              <div>
                <strong
                  className="block text-gray-900 text-sm uppercase tracking-wide mb-1"
                  data-editor-page="contact"
                  data-editor-field="addressLabel"
                  data-editor-path="info.addressLabel"
                  data-editor-type="text"
                >
                  {addressLabel}
                </strong>
                <span
                  data-editor-page="contact"
                  data-editor-field="address"
                  data-editor-path="info.address"
                  data-editor-type="text"
                >
                  {content.info?.address}
                </span>
              </div>
              <div>
                <strong
                  className="block text-gray-900 text-sm uppercase tracking-wide mb-1"
                  data-editor-page="contact"
                  data-editor-field="emailLabel"
                  data-editor-path="info.emailLabel"
                  data-editor-type="text"
                >
                  {emailLabel}
                </strong>
                <span
                  data-editor-page="contact"
                  data-editor-field="email"
                  data-editor-path="info.email"
                  data-editor-type="text"
                >
                  {content.info?.email}
                </span>
              </div>
              <div>
                <strong
                  className="block text-gray-900 text-sm uppercase tracking-wide mb-1"
                  data-editor-page="contact"
                  data-editor-field="phoneLabel"
                  data-editor-path="info.phoneLabel"
                  data-editor-type="text"
                >
                  {phoneLabel}
                </strong>
                <span
                  data-editor-page="contact"
                  data-editor-field="phone"
                  data-editor-path="info.phone"
                  data-editor-type="text"
                >
                  {content.info?.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 border border-gray-200" data-editor-section="form">
            <h2
              className="text-2xl font-bold text-gray-900 mb-8"
              data-editor-page="contact"
              data-editor-field="title"
              data-editor-path="form.title"
              data-editor-type="text"
            >
              {content.form?.title}
            </h2>

            {submitted && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 text-sm flex items-center justify-between">
                <span>{successMessage}</span>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-green-900 font-semibold ml-4 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                  data-editor-page="contact"
                  data-editor-field="nameLabel"
                  data-editor-path="form.nameLabel"
                  data-editor-type="text"
                >
                  {nameLabel}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 bg-white text-gray-900 p-3 focus:outline-none focus:border-black"
                  placeholder={namePlaceholder}
                  required
                />
                <div
                  className="hidden"
                  data-editor-page="contact"
                  data-editor-field="namePlaceholder"
                  data-editor-path="form.namePlaceholder"
                  data-editor-type="text"
                >
                  {namePlaceholder}
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                  data-editor-page="contact"
                  data-editor-field="emailLabel"
                  data-editor-path="form.emailLabel"
                  data-editor-type="text"
                >
                  {emailFieldLabel}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 bg-white text-gray-900 p-3 focus:outline-none focus:border-black"
                  placeholder={emailPlaceholder}
                  required
                />
                <div
                  className="hidden"
                  data-editor-page="contact"
                  data-editor-field="emailPlaceholder"
                  data-editor-path="form.emailPlaceholder"
                  data-editor-type="text"
                >
                  {emailPlaceholder}
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                  data-editor-page="contact"
                  data-editor-field="messageLabel"
                  data-editor-path="form.messageLabel"
                  data-editor-type="text"
                >
                  {messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 bg-white text-gray-900 p-3 h-32 focus:outline-none focus:border-black"
                  placeholder={messagePlaceholder}
                  required
                />
                <div
                  className="hidden"
                  data-editor-page="contact"
                  data-editor-field="messagePlaceholder"
                  data-editor-path="form.messagePlaceholder"
                  data-editor-type="text"
                >
                  {messagePlaceholder}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white p-4 font-bold hover:bg-gray-800 transition-colors"
                data-editor-page="contact"
                data-editor-field="submitText"
                data-editor-path="form.submitText"
                data-editor-type="text"
              >
                {content.form?.submitText}
              </button>
              <div
                className="hidden"
                data-editor-page="contact"
                data-editor-field="successMessage"
                data-editor-path="form.successMessage"
                data-editor-type="textarea"
              >
                {successMessage}
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
