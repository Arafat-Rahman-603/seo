export default function ContactContent({ content }: { content: any }) {
  if (!content) return null;

  return (
    <main data-editor-page="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-24" data-editor-section="header">
          <h1 
            className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6"
            data-editor-field="title"
            data-editor-path="header.title"
          >
            {content.header.title}
          </h1>
          <p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            data-editor-field="description"
            data-editor-path="header.description"
          >
            {content.header.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div data-editor-section="info">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>
            <div className="space-y-6 text-lg text-gray-600">
              <div>
                <strong className="block text-gray-900 text-sm uppercase tracking-wide mb-1">Address</strong>
                <span data-editor-field="address" data-editor-path="info.address">{content.info.address}</span>
              </div>
              <div>
                <strong className="block text-gray-900 text-sm uppercase tracking-wide mb-1">Email</strong>
                <span data-editor-field="email" data-editor-path="info.email">{content.info.email}</span>
              </div>
              <div>
                <strong className="block text-gray-900 text-sm uppercase tracking-wide mb-1">Phone</strong>
                <span data-editor-field="phone" data-editor-path="info.phone">{content.info.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 border border-gray-200" data-editor-section="form">
            <h2 
              className="text-2xl font-bold text-gray-900 mb-8"
              data-editor-field="title"
              data-editor-path="form.title"
            >
              {content.form.title}
            </h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" className="w-full border border-gray-300 p-3" placeholder="Jane Doe" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full border border-gray-300 p-3" placeholder="jane@example.com" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea className="w-full border border-gray-300 p-3 h-32" placeholder="How can we help you?" disabled></textarea>
              </div>
              <button 
                type="button" 
                className="w-full bg-black text-white p-4 font-bold hover:bg-gray-800"
                data-editor-field="submitText"
                data-editor-path="form.submitText"
              >
                {content.form.submitText}
              </button>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}
