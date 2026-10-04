const testAuth = async () => {
  try {
    let res = await fetch('http://localhost:5000/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'viewer@demo.com', password: 'demo123' })
    });
    const cookie = res.headers.get('set-cookie');
    console.log('Login success');

    // Test 1: Get projects
    res = await fetch('http://localhost:5000/api/projects', {
       headers: { 'Cookie': cookie! }
    });
    const data = await res.json();
    console.log('Projects available:', data.data.map((p: any) => p.name));
    
    // Get Secret Project ID
    let secretProjectId = '';
    const adminRes = await fetch('http://localhost:5000/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email: 'admin@demo.com', password: 'demo123' })
    });
    const adminCookie = adminRes.headers.get('set-cookie');
    
    const allProjectsRes = await fetch('http://localhost:5000/api/projects', {
       headers: { 'Cookie': adminCookie! }
    });
    const allProjectsData = await allProjectsRes.json();
    const secretProject = allProjectsData.data.find((p: any) => p.name === 'Secret Project');
    secretProjectId = secretProject._id;
    
    console.log('Secret Project ID:', secretProjectId);
    
    // Test 2: Try to access Secret Project as Viewer
    const idorRes = await fetch(`http://localhost:5000/api/projects/${secretProjectId}`, {
       headers: { 'Cookie': cookie! }
    });
    
    const idorData = await idorRes.json();
    if (idorRes.ok) {
       console.log('IDOR FAILURE: Successfully accessed secret project', idorData);
    } else {
       console.log('IDOR SUCCESS: Prevented access to secret project:', idorData.message);
    }
  } catch (error: any) {
    console.error('Test error:', error.message);
  }
};

testAuth();
