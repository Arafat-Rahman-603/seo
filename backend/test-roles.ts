const testRoles = async () => {
  try {
    let res = await fetch('http://localhost:5000/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'editor@demo.com', password: 'demo123' })
    });
    const cookie = res.headers.get('set-cookie');
    console.log('Editor Login success');

    const allProjectsRes = await fetch('http://localhost:5000/api/projects', {
       headers: { 'Cookie': cookie! }
    });
    const allProjectsData = await allProjectsRes.json();
    const projectId = allProjectsData.data[0]._id;
    
    // Test 1: Editor tries to publish
    const publishRes = await fetch(`http://localhost:5000/api/projects/${projectId}/versions/publish`, {
       method: 'POST',
       headers: { 'Cookie': cookie! }
    });
    
    const publishData = await publishRes.json();
    if (publishRes.ok) {
       console.log('ROLE FAILURE: Editor successfully published project', publishData);
    } else {
       console.log('ROLE SUCCESS: Prevented Editor from publishing:', publishData.message);
    }

    // Test 2: Viewer tries to save content
    let viewerRes = await fetch('http://localhost:5000/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'viewer@demo.com', password: 'demo123' })
    });
    const viewerCookie = viewerRes.headers.get('set-cookie');
    console.log('Viewer Login success');
    
    const saveRes = await fetch(`http://localhost:5000/api/projects/${projectId}/content`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json', 'Cookie': viewerCookie! },
       body: JSON.stringify({ changes: [{ page: 'home', path: 'hero.title', value: 'Test' }] })
    });

    const saveData = await saveRes.json();
    if (saveRes.ok) {
       console.log('ROLE FAILURE: Viewer successfully saved content', saveData);
    } else {
       console.log('ROLE SUCCESS: Prevented Viewer from saving content:', saveData.message);
    }

  } catch (error: any) {
    console.error('Test error:', error.message);
  }
};

testRoles();
