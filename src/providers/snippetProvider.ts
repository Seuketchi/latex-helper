import * as vscode from 'vscode';

interface SnippetInfo {
    name: string;
    command: string;
    icon: string;
    description: string;
}

export class SnippetProvider implements vscode.TreeDataProvider<SnippetItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SnippetItem | undefined | null | void> = new vscode.EventEmitter<SnippetItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SnippetItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private snippets: SnippetInfo[] = [
        { name: 'New Document', command: 'latexHelper.newFromTemplate', icon: 'new-file', description: 'Create from template (IEEE, Thesis...)' },
        { name: 'Figure', command: 'latexHelper.insertFigure', icon: 'file-media', description: 'Insert figure environment' },
        { name: 'Table', command: 'latexHelper.insertTable', icon: 'table', description: 'Insert table environment' },
        { name: 'Citation', command: 'latexHelper.insertCitation', icon: 'quote', description: 'Insert citation' },
        { name: 'Section', command: 'latexHelper.insertSection', icon: 'list-tree', description: 'Insert section' },
        { name: 'Template', command: 'latexHelper.insertTemplate', icon: 'file-code', description: 'Insert thesis template' },
        { name: 'Word Goal', command: 'latexHelper.setWordGoal', icon: 'target', description: 'Set word count goal' },
        { name: 'Compile', command: 'latexHelper.compileDocument', icon: 'play', description: 'Compile document' }
    ];

    getTreeItem(element: SnippetItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SnippetItem): Thenable<SnippetItem[]> {
        if (!element) {
            return Promise.resolve(this.snippets.map(s => new SnippetItem(s)));
        }
        return Promise.resolve([]);
    }
}

class SnippetItem extends vscode.TreeItem {
    constructor(public readonly snippet: SnippetInfo) {
        super(snippet.name, vscode.TreeItemCollapsibleState.None);
        
        this.iconPath = new vscode.ThemeIcon(snippet.icon);
        this.description = snippet.description;
        this.tooltip = snippet.description;
        
        this.command = {
            command: snippet.command,
            title: snippet.name
        };
    }
}
