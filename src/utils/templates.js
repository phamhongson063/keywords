// Template loader - Load all templates before app initialization
const Templates = {};

async function loadAllTemplates() {
  const templateFiles = ['Home', 'PracticeMenu', 'Practice', 'Flashcard', 'NotFound'];
  
  const loadPromises = templateFiles.map(async (name) => {
    try {
      // Try to fetch template - live-server might inject code
      let response = await fetch(`src/views/${name}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${name}`);
      }
      let template = await response.text();
      
      // For Practice template: Skip file loading since it's hardcoded in Practice.js
      // Just store a placeholder to avoid errors
      if (name === 'Practice') {
        console.log('Practice template: Skipping file load (using hardcoded template in Practice.js)');
        Templates[name] = '<div>Template loaded from Practice.js component</div>';
        return; // Skip processing for Practice template
      }
      
      // Remove live-server injected scripts and styles
      // Remove all script tags (including live-server injected ones)
      template = template.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      // Remove all style tags
      template = template.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      // Remove HTML comments that might contain injected code (but keep important ones)
      // Only remove comments that are not part of template structure
      template = template.replace(/<!-- Code injected by live-server -->/gi, '');
      // Remove any script/style injection comments but keep template comments
      // Be VERY specific to avoid removing valid HTML - only remove live-server specific comments
      // Don't use greedy regex that might match across multiple comments
      template = template.replace(/<!--\s*Code injected by live-server\s*-->/gi, '');
      
      // IMPORTANT: Remove any injected code that might be inside tags
      // Live-server might inject script tags inside textarea or other tags
      // This regex removes script tags even if they're inside other tags
      template = template.replace(/<script[\s\S]*?<\/script>/gi, '');
      
      Templates[name] = template.trim();
      
      // Practice template is hardcoded, so no need to log here
    } catch (error) {
      console.error(`Error loading template ${name}:`, error);
      Templates[name] = `<div>Error loading template: ${name}</div>`;
    }
  });
  
  await Promise.all(loadPromises);
  return Templates;
}

// Export
window.Templates = Templates;
window.loadAllTemplates = loadAllTemplates;

