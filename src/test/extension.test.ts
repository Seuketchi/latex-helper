import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('seuketchi.latex-thesis-helper'));
	});

	test('Extension should activate on LaTeX files', async () => {
		const ext = vscode.extensions.getExtension('seuketchi.latex-thesis-helper');
		assert.ok(ext);
		await ext.activate();
		assert.strictEqual(ext.isActive, true);
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		
		const expectedCommands = [
			'latexHelper.insertFigure',
			'latexHelper.insertTable',
			'latexHelper.insertCitation',
			'latexHelper.insertSection',
			'latexHelper.insertTemplate',
			'latexHelper.refreshSections',
			'latexHelper.refreshBibliography',
			'latexHelper.refreshFigures',
			'latexHelper.compileDocument',
			'latexHelper.setWordGoal',
			'latexHelper.newFromTemplate'
		];

		for (const cmd of expectedCommands) {
			assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
		}
	});

	test('Configuration should have correct defaults', () => {
		const config = vscode.workspace.getConfiguration('latexHelper');
		
		assert.strictEqual(config.get('latexEngine'), 'pdflatex');
		assert.strictEqual(config.get('bibliographyTool'), 'none');
		assert.strictEqual(config.get('wordCountGoal'), 0);
	});

	test('Path handling should be cross-platform', () => {
		// Test that path.join works correctly on all platforms
		const testPath = path.join('folder', 'subfolder', 'file.tex');
		
		// Should not contain mixed separators
		assert.ok(!testPath.includes('/') || !testPath.includes('\\'), 
			'Path should use consistent separators');
		
		// Should resolve to expected parts
		const parts = testPath.split(path.sep);
		assert.strictEqual(parts[0], 'folder');
		assert.strictEqual(parts[1], 'subfolder');
		assert.strictEqual(parts[2], 'file.tex');
	});

	test('Platform detection should work', () => {
		const platform = process.platform;
		assert.ok(
			['win32', 'darwin', 'linux'].includes(platform),
			`Platform ${platform} should be recognized`
		);
	});
});
