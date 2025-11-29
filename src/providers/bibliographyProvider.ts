import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface Citation {
    key: string;
    type: string;
    title: string;
    author: string;
    year: string;
    file: string;
    line: number;
}

export class BibliographyProvider implements vscode.TreeDataProvider<CitationItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CitationItem | undefined | null | void> = new vscode.EventEmitter<CitationItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CitationItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private citations: Citation[] = [];

    refresh(): void {
        this.parseBibFiles();
        this._onDidChangeTreeData.fire();
    }

    getCitations(): Citation[] {
        return this.citations;
    }

    private async parseBibFiles(): Promise<void> {
        this.citations = [];
        
        const bibFiles = await vscode.workspace.findFiles('**/*.bib', '**/node_modules/**');
        
        for (const bibFile of bibFiles) {
            try {
                const content = fs.readFileSync(bibFile.fsPath, 'utf8');
                this.parseBibContent(content, bibFile.fsPath);
            } catch (error) {
                console.error(`Error reading ${bibFile.fsPath}:`, error);
            }
        }
    }

    private parseBibContent(content: string, filePath: string): void {
        const lines = content.split('\n');
        const entryRegex = /@(\w+)\s*\{\s*([^,]+)\s*,/;
        
        let currentEntry: Partial<Citation> | null = null;
        let currentLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const entryMatch = line.match(entryRegex);
            
            if (entryMatch) {
                if (currentEntry && currentEntry.key) {
                    this.citations.push(currentEntry as Citation);
                }
                
                currentEntry = {
                    type: entryMatch[1].toLowerCase(),
                    key: entryMatch[2].trim(),
                    title: '',
                    author: '',
                    year: '',
                    file: filePath,
                    line: i
                };
                currentLine = i;
            } else if (currentEntry) {
                // Parse fields
                const titleMatch = line.match(/title\s*=\s*[{"](.+?)[}"]/i);
                const authorMatch = line.match(/author\s*=\s*[{"](.+?)[}"]/i);
                const yearMatch = line.match(/year\s*=\s*[{"]?(\d{4})[}"]?/i);
                
                if (titleMatch) currentEntry.title = titleMatch[1];
                if (authorMatch) currentEntry.author = this.formatAuthors(authorMatch[1]);
                if (yearMatch) currentEntry.year = yearMatch[1];
            }
        }
        
        // Don't forget the last entry
        if (currentEntry && currentEntry.key) {
            this.citations.push(currentEntry as Citation);
        }
    }

    private formatAuthors(authors: string): string {
        const authorList = authors.split(' and ');
        if (authorList.length === 1) {
            return this.getLastName(authorList[0]);
        } else if (authorList.length === 2) {
            return `${this.getLastName(authorList[0])} & ${this.getLastName(authorList[1])}`;
        } else {
            return `${this.getLastName(authorList[0])} et al.`;
        }
    }

    private getLastName(author: string): string {
        const parts = author.split(',');
        if (parts.length > 1) {
            return parts[0].trim();
        }
        const nameParts = author.trim().split(' ');
        return nameParts[nameParts.length - 1];
    }

    getTreeItem(element: CitationItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CitationItem): Thenable<CitationItem[]> {
        if (!element) {
            return Promise.resolve(
                this.citations.map(c => new CitationItem(c))
            );
        }
        return Promise.resolve([]);
    }
}

class CitationItem extends vscode.TreeItem {
    constructor(public readonly citation: Citation) {
        super(citation.key, vscode.TreeItemCollapsibleState.None);
        
        const typeIcon: { [key: string]: string } = {
            'article': '📄',
            'book': '📚',
            'inproceedings': '📋',
            'misc': '��',
            'online': '🌐',
            'phdthesis': '🎓',
            'mastersthesis': '🎓',
            'techreport': '📊'
        };
        
        const icon = typeIcon[citation.type] || '📄';
        
        this.label = `${icon} ${citation.key}`;
        this.description = citation.year;
        this.tooltip = `${citation.title}\n${citation.author} (${citation.year})\nType: ${citation.type}`;
        
        this.command = {
            command: 'latexHelper.insertCitation',
            title: 'Insert Citation',
            arguments: [citation]
        };
        
        this.contextValue = 'citation';
    }
}
