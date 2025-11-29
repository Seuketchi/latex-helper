import * as vscode from 'vscode';

export class StatsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'latexHelper.stats';
    private _view?: vscode.WebviewView;
    private _wordGoal: number = 0;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this._wordGoal = vscode.workspace.getConfiguration('latexHelper').get('wordCountGoal', 0);
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._extensionUri] };
        this.updateStats();
    }

    public refresh() { this.updateStats(); }
    public show() { if (this._view) { this._view.show(true); } }

    public async setWordGoal() {
        const input = await vscode.window.showInputBox({
            prompt: 'Set your word count goal',
            value: this._wordGoal.toString(),
            validateInput: (value) => {
                const num = parseInt(value);
                if (isNaN(num) || num < 0) {
                    return 'Please enter a valid positive number';
                }
                return null;
            }
        });
        if (input !== undefined) {
            this._wordGoal = parseInt(input);
            await vscode.workspace.getConfiguration('latexHelper').update('wordCountGoal', this._wordGoal, vscode.ConfigurationTarget.Workspace);
            this.updateStats();
            vscode.window.showInformationMessage(`Word count goal set to ${this._wordGoal} words`);
        }
    }

    private updateStats() {
        if (!this._view) { return; }
        const stats = this.calculateStats();
        this._view.webview.html = this.getHtmlContent(stats);
    }

    private calculateStats(): DocumentStats {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.document.fileName.endsWith('.tex')) {
            return { wordCount: 0, charCount: 0, lineCount: 0, pageCount: 0, citationCount: 0, figureCount: 0, tableCount: 0, sectionCount: 0 };
        }
        const text = editor.document.getText();
        const cleanText = text.replace(/%.*/g, '').replace(/\\[a-zA-Z]+\{[^}]*\}/g, '').replace(/\\[a-zA-Z]+/g, '').replace(/[{}\\$%&_^~#\[\]]/g, '').replace(/\s+/g, ' ').trim();
        const words = cleanText.split(/\s+/).filter(w => w.length > 0);
        return {
            wordCount: words.length,
            charCount: cleanText.length,
            lineCount: editor.document.lineCount,
            pageCount: Math.ceil(words.length / 250),
            citationCount: (text.match(/\\cite\{[^}]+\}/g) || []).length,
            figureCount: (text.match(/\\begin\{figure\}/g) || []).length,
            tableCount: (text.match(/\\begin\{table\}/g) || []).length,
            sectionCount: (text.match(/\\(section|subsection|subsubsection)\{/g) || []).length
        };
    }

    private getHtmlContent(stats: DocumentStats): string {
        const goalProgress = this._wordGoal > 0 ? Math.min(100, Math.round((stats.wordCount / this._wordGoal) * 100)) : 0;
        const goalHtml = this._wordGoal > 0 
            ? `<div class="goal-section">
                <div class="goal-header">📎 Goal: ${stats.wordCount.toLocaleString()} / ${this._wordGoal.toLocaleString()} words</div>
                <div class="progress-bar"><div class="progress-fill" style="width:${goalProgress}%"></div></div>
                <div class="goal-percent">${goalProgress}% complete</div>
               </div>`
            : `<div class="goal-section"><div class="goal-hint">💡 Set a word count goal to track progress</div></div>`;
        
        return `<!DOCTYPE html><html><head><style>
            body{font-family:var(--vscode-font-family);padding:10px;}
            .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
            .stat-item{background:var(--vscode-editor-background);border:1px solid var(--vscode-panel-border);border-radius:4px;padding:8px;text-align:center;}
            .stat-value{font-size:1.4em;font-weight:bold;color:var(--vscode-textLink-foreground);}
            .stat-label{font-size:0.85em;color:var(--vscode-descriptionForeground);}
            .goal-section{margin-top:12px;padding:10px;background:var(--vscode-editor-background);border:1px solid var(--vscode-panel-border);border-radius:4px;}
            .goal-header{font-size:0.9em;margin-bottom:8px;color:var(--vscode-foreground);}
            .goal-hint{font-size:0.85em;color:var(--vscode-descriptionForeground);text-align:center;}
            .progress-bar{height:8px;background:var(--vscode-progressBar-background);border-radius:4px;overflow:hidden;}
            .progress-fill{height:100%;background:var(--vscode-progressBar-background);background:linear-gradient(90deg,#4caf50,#8bc34a);transition:width 0.3s;}
            .goal-percent{font-size:0.8em;color:var(--vscode-descriptionForeground);text-align:right;margin-top:4px;}
        </style></head><body>
        <div class="stat-grid">
            <div class="stat-item"><div class="stat-value">${stats.wordCount.toLocaleString()}</div><div class="stat-label">Words</div></div>
            <div class="stat-item"><div class="stat-value">~${stats.pageCount}</div><div class="stat-label">Pages</div></div>
            <div class="stat-item"><div class="stat-value">${stats.sectionCount}</div><div class="stat-label">Sections</div></div>
            <div class="stat-item"><div class="stat-value">${stats.citationCount}</div><div class="stat-label">Citations</div></div>
            <div class="stat-item"><div class="stat-value">${stats.figureCount}</div><div class="stat-label">Figures</div></div>
            <div class="stat-item"><div class="stat-value">${stats.tableCount}</div><div class="stat-label">Tables</div></div>
        </div>
        ${goalHtml}
        </body></html>`;
    }
}

interface DocumentStats { wordCount: number; charCount: number; lineCount: number; pageCount: number; citationCount: number; figureCount: number; tableCount: number; sectionCount: number; }
