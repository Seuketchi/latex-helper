import * as vscode from 'vscode';
import { SectionTreeProvider } from './providers/sectionProvider';
import { BibliographyProvider } from './providers/bibliographyProvider';
import { FigureTableProvider } from './providers/figureTableProvider';
import { SnippetProvider } from './providers/snippetProvider';
import { StatsViewProvider } from './providers/statsProvider';
import { TemplateInserter } from './providers/templateInserter';
import { DocumentTemplateProvider } from './providers/documentTemplates';

export function activate(context: vscode.ExtensionContext) {
    console.log('LaTeX Thesis Helper is now active!');

    // Initialize providers
    const sectionProvider = new SectionTreeProvider();
    const bibliographyProvider = new BibliographyProvider();
    const figureTableProvider = new FigureTableProvider();
    const snippetProvider = new SnippetProvider();
    const statsProvider = new StatsViewProvider(context.extensionUri);
    const templateInserter = new TemplateInserter();
    const documentTemplateProvider = new DocumentTemplateProvider();

    // Register tree views
    vscode.window.registerTreeDataProvider('latexHelper.sections', sectionProvider);
    vscode.window.registerTreeDataProvider('latexHelper.bibliography', bibliographyProvider);
    vscode.window.registerTreeDataProvider('latexHelper.figures', figureTableProvider);
    vscode.window.registerTreeDataProvider('latexHelper.snippets', snippetProvider);
    
    // Register webview provider for stats
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('latexHelper.stats', statsProvider)
    );

    // Register commands
    context.subscriptions.push(
        // Insert commands
        vscode.commands.registerCommand('latexHelper.insertFigure', () => templateInserter.insertFigure()),
        vscode.commands.registerCommand('latexHelper.insertTable', () => templateInserter.insertTable()),
        vscode.commands.registerCommand('latexHelper.insertCitation', () => insertCitation(bibliographyProvider)),
        vscode.commands.registerCommand('latexHelper.insertSection', () => templateInserter.insertSection()),
        vscode.commands.registerCommand('latexHelper.insertTemplate', () => templateInserter.insertTemplate()),
        
        // Refresh commands
        vscode.commands.registerCommand('latexHelper.refreshSections', () => sectionProvider.refresh()),
        vscode.commands.registerCommand('latexHelper.refreshBibliography', () => bibliographyProvider.refresh()),
        vscode.commands.registerCommand('latexHelper.refreshFigures', () => figureTableProvider.refresh()),
        
        // Navigation commands
        vscode.commands.registerCommand('latexHelper.goToSection', (item) => goToLocation(item)),
        vscode.commands.registerCommand('latexHelper.goToFigure', (item) => goToLocation(item)),
        
        // Stats command
        vscode.commands.registerCommand('latexHelper.showStats', () => statsProvider.show()),
        vscode.commands.registerCommand('latexHelper.setWordGoal', () => statsProvider.setWordGoal()),
        
        // Compile command
        vscode.commands.registerCommand('latexHelper.compileDocument', () => compileDocument()),
        
        // Document template command
        vscode.commands.registerCommand('latexHelper.newFromTemplate', () => documentTemplateProvider.createFromTemplate())
    );

    // Auto-refresh on document save
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((doc) => {
            if (doc.languageId === 'latex' || doc.fileName.endsWith('.tex')) {
                sectionProvider.refresh();
                figureTableProvider.refresh();
                statsProvider.refresh();
            }
            if (doc.languageId === 'bibtex' || doc.fileName.endsWith('.bib')) {
                bibliographyProvider.refresh();
            }
        })
    );

    // Auto-refresh on active editor change
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && (editor.document.languageId === 'latex' || editor.document.fileName.endsWith('.tex'))) {
                sectionProvider.refresh();
                figureTableProvider.refresh();
                statsProvider.refresh();
            }
        })
    );

    // Initial refresh
    sectionProvider.refresh();
    bibliographyProvider.refresh();
    figureTableProvider.refresh();
}

async function insertCitation(bibliographyProvider: BibliographyProvider) {
    const citations = bibliographyProvider.getCitations();
    if (citations.length === 0) {
        vscode.window.showWarningMessage('No citations found. Make sure you have a .bib file in your workspace.');
        return;
    }

    const items = citations.map(c => ({
        label: c.key,
        description: c.title,
        detail: `${c.author} (${c.year})`
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a citation to insert',
        matchOnDescription: true,
        matchOnDetail: true
    });

    if (selected) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, `\\cite{${selected.label}}`);
            });
        }
    }
}

function goToLocation(item: any) {
    if (item && item.location) {
        const uri = vscode.Uri.file(item.location.file);
        vscode.workspace.openTextDocument(uri).then(doc => {
            vscode.window.showTextDocument(doc).then(editor => {
                const position = new vscode.Position(item.location.line, 0);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
            });
        });
    }
}

async function compileDocument() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !editor.document.fileName.endsWith('.tex')) {
        vscode.window.showWarningMessage('Please open a .tex file to compile.');
        return;
    }

    // Check if LaTeX Workshop extension is installed
    const latexWorkshop = vscode.extensions.getExtension('James-Yu.latex-workshop');
    
    if (latexWorkshop) {
        // LaTeX Workshop is installed - use its build command
        vscode.commands.executeCommand('latex-workshop.build');
    } else {
        // LaTeX Workshop not installed - prompt to install
        const selection = await vscode.window.showWarningMessage(
            'LaTeX Workshop extension is recommended for compiling LaTeX documents. It provides compilation, PDF preview, and error highlighting.',
            'Install LaTeX Workshop',
            'Learn More'
        );
        
        if (selection === 'Install LaTeX Workshop') {
            vscode.commands.executeCommand('workbench.extensions.installExtension', 'James-Yu.latex-workshop');
        } else if (selection === 'Learn More') {
            vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop'));
        }
    }
}

export function deactivate() {}
