const { applyPhase3 } = require('./zelador/modules/phases');
const path = require('path');
const fs = require('fs');

async function test() {
  const vaultPath = path.resolve(__dirname);
  const testFile = path.join(vaultPath, 'ideas', 'teste-sem-ia.md');
  
  if (!fs.existsSync(path.dirname(testFile))) {
    fs.mkdirSync(path.dirname(testFile), { recursive: true });
  }
  
  fs.writeFileSync(testFile, '---\ntitle: Teste F3 sem IA\ndecay_level: 2\n---\nConteúdo de teste para fossilização sem IA.', 'utf-8');
  
  // Limpar env vars de API key para o teste
  delete process.env.GOOGLE_AI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  process.env.AI_PROVIDER = 'google';

  console.log('Iniciando applyPhase3 sem API Key...');
  const result = await applyPhase3(testFile, vaultPath, { decay_level: 2 });
  
  console.log('Resultado:', JSON.stringify(result, null, 2));
  
  if (fs.existsSync(testFile)) {
    const content = fs.readFileSync(testFile, 'utf-8');
    console.log('Conteúdo da nota leve:\n', content);
  } else {
    console.log('ERRO: Nota leve não encontrada!');
  }
}

test().catch(console.error);
