export default function AboutContent({ content }: { content: any }) {
  if (!content) return null;

  return (
    <main data-editor-page="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-24" data-editor-section="header">
          <h1 
            className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6"
            data-editor-field="title"
            data-editor-path="header.title"
          >
            {content.header.title}
          </h1>
          <p 
            className="text-xl text-gray-600 max-w-3xl leading-relaxed"
            data-editor-field="description"
            data-editor-path="header.description"
          >
            {content.header.description}
          </p>
        </div>

        <div className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-12" data-editor-section="mission">
          <div>
            <h2 
              className="text-3xl font-bold text-gray-900 mb-6"
              data-editor-field="title"
              data-editor-path="mission.title"
            >
              {content.mission.title}
            </h2>
            <p 
              className="text-lg text-gray-600"
              data-editor-field="description"
              data-editor-path="mission.description"
            >
              {content.mission.description}
            </p>
          </div>
          <div className="bg-gray-100 aspect-video flex items-center justify-center text-gray-400">
            [ Team Image Placeholder ]
          </div>
        </div>

        <div data-editor-section="team">
          <h2 
            className="text-3xl font-bold text-gray-900 mb-12 text-center"
            data-editor-field="title"
            data-editor-path="team.title"
          >
            {content.team.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.team.members?.map((member: any, index: number) => (
              <div key={index} className="border border-gray-200 p-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <h3 
                  className="text-xl font-bold text-gray-900 text-center"
                  data-editor-field="name"
                  data-editor-path={`team.members.${index}.name`}
                >
                  {member.name}
                </h3>
                <p 
                  className="text-sm text-blue-600 font-medium text-center mb-4 uppercase tracking-wide"
                  data-editor-field="role"
                  data-editor-path={`team.members.${index}.role`}
                >
                  {member.role}
                </p>
                <p 
                  className="text-gray-600 text-center"
                  data-editor-field="bio"
                  data-editor-path={`team.members.${index}.bio`}
                >
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
