export default function AboutContent({ content }: { content: any }) {
  if (!content) return null;

  const badge = content.mission?.badge ?? 'Northstar Digital';
  const tagline = content.mission?.tagline ?? 'Strategy • Engineering • Growth';
  const imageUrl = content.mission?.imageUrl ?? '';

  return (
    <main data-editor-page="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-24" data-editor-section="header">
          <h1
            className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6"
            data-editor-page="about"
            data-editor-field="title"
            data-editor-path="header.title"
            data-editor-type="text"
          >
            {content.header?.title}
          </h1>
          <p
            className="text-xl text-gray-600 max-w-3xl leading-relaxed"
            data-editor-page="about"
            data-editor-field="description"
            data-editor-path="header.description"
            data-editor-type="textarea"
          >
            {content.header?.description}
          </p>
        </div>

        <div className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center" data-editor-section="mission">
          <div>
            <h2
              className="text-3xl font-bold text-gray-900 mb-6"
              data-editor-page="about"
              data-editor-field="title"
              data-editor-path="mission.title"
              data-editor-type="text"
            >
              {content.mission?.title}
            </h2>
            <p
              className="text-lg text-gray-600 leading-relaxed"
              data-editor-page="about"
              data-editor-field="description"
              data-editor-path="mission.description"
              data-editor-type="textarea"
            >
              {content.mission?.description}
            </p>
          </div>
          <div className="bg-gray-100 border border-gray-200 aspect-video flex flex-col items-center justify-center text-gray-500 p-6 overflow-hidden relative">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={badge} className="w-full h-full object-cover" />
            ) : (
              <>
                <span
                  className="text-sm font-semibold uppercase tracking-widest text-gray-500"
                  data-editor-page="about"
                  data-editor-field="badge"
                  data-editor-path="mission.badge"
                  data-editor-type="text"
                >
                  {badge}
                </span>
                <span
                  className="text-xs text-gray-400 mt-1"
                  data-editor-page="about"
                  data-editor-field="tagline"
                  data-editor-path="mission.tagline"
                  data-editor-type="text"
                >
                  {tagline}
                </span>
              </>
            )}
            {imageUrl && (
              <>
                <div
                  className="hidden"
                  data-editor-page="about"
                  data-editor-field="badge"
                  data-editor-path="mission.badge"
                  data-editor-type="text"
                >
                  {badge}
                </div>
                <div
                  className="hidden"
                  data-editor-page="about"
                  data-editor-field="tagline"
                  data-editor-path="mission.tagline"
                  data-editor-type="text"
                >
                  {tagline}
                </div>
              </>
            )}
            <div
              className="hidden"
              data-editor-page="about"
              data-editor-field="imageUrl"
              data-editor-path="mission.imageUrl"
              data-editor-type="url"
            >
              {imageUrl}
            </div>
          </div>
        </div>

        <div data-editor-section="team">
          <h2
            className="text-3xl font-bold text-gray-900 mb-12 text-center"
            data-editor-page="about"
            data-editor-field="title"
            data-editor-path="team.title"
            data-editor-type="text"
          >
            {content.team?.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.team?.members?.map((member: any, index: number) => (
              <div key={index} className="border border-gray-200 p-6 bg-white">
                <div className="w-20 h-20 bg-gray-900 text-white rounded-full mx-auto mb-6 flex items-center justify-center font-bold text-xl">
                  {(member.name || '?')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <h3
                  className="text-xl font-bold text-gray-900 text-center"
                  data-editor-page="about"
                  data-editor-field={`member ${index + 1} name`}
                  data-editor-path={`team.members.${index}.name`}
                  data-editor-type="text"
                >
                  {member.name}
                </h3>
                <p
                  className="text-sm text-blue-600 font-medium text-center mb-4 uppercase tracking-wide"
                  data-editor-page="about"
                  data-editor-field={`member ${index + 1} role`}
                  data-editor-path={`team.members.${index}.role`}
                  data-editor-type="text"
                >
                  {member.role}
                </p>
                <p
                  className="text-gray-600 text-center"
                  data-editor-page="about"
                  data-editor-field={`member ${index + 1} bio`}
                  data-editor-path={`team.members.${index}.bio`}
                  data-editor-type="textarea"
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
