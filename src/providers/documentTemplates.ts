import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface DocumentTemplate {
    label: string;
    description: string;
    detail: string;
    files: { [filename: string]: string };
}

export class DocumentTemplateProvider {
    
    async createFromTemplate(): Promise<void> {
        const templates: vscode.QuickPickItem[] = [
            { label: '📄 IEEE Conference Paper', description: 'IEEEtran class', detail: 'Standard IEEE conference paper format' },
            { label: '📄 IEEE Journal Article', description: 'IEEEtran class', detail: 'IEEE journal article format with two columns' },
            { label: '📚 Thesis - Standard', description: 'report class', detail: 'Standard thesis format with chapters' },
            { label: '📚 Thesis - Book Style', description: 'book class', detail: 'Book-style thesis with parts and chapters' },
            { label: '📝 Academic Article', description: 'article class', detail: 'Simple academic article format' },
            { label: '📊 Research Proposal', description: 'article class', detail: 'Research proposal template' },
            { label: '🎓 Dissertation', description: 'report class', detail: 'Full dissertation template with front matter' },
        ];

        const selected = await vscode.window.showQuickPick(templates, {
            placeHolder: 'Select a document template',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selected) return;

        // Get project name
        const projectName = await vscode.window.showInputBox({
            prompt: 'Enter project/document name',
            value: 'my-document',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Please enter a valid name';
                }
                if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                    return 'Use only letters, numbers, hyphens, and underscores';
                }
                return null;
            }
        });

        if (!projectName) return;

        // Get target folder
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            vscode.window.showErrorMessage('Please open a folder first');
            return;
        }

        const targetFolder = folders[0].uri.fsPath;
        const projectPath = path.join(targetFolder, projectName);

        // Check if folder exists
        if (fs.existsSync(projectPath)) {
            const overwrite = await vscode.window.showWarningMessage(
                `Folder "${projectName}" already exists. Overwrite?`,
                'Yes', 'No'
            );
            if (overwrite !== 'Yes') return;
        }

        // Create project structure
        try {
            const template = this.getTemplate(selected.label, projectName);
            await this.createProjectStructure(projectPath, template);
            
            // Open main.tex
            const mainTexPath = path.join(projectPath, 'main.tex');
            const document = await vscode.workspace.openTextDocument(mainTexPath);
            await vscode.window.showTextDocument(document);
            
            vscode.window.showInformationMessage(`Created ${selected.label} project: ${projectName}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create project: ${error}`);
        }
    }

    private async createProjectStructure(projectPath: string, template: DocumentTemplate): Promise<void> {
        // Create main directory
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }

        // Create subdirectories
        const subDirs = ['figures', 'chapters', 'sections'];
        for (const dir of subDirs) {
            const dirPath = path.join(projectPath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }

        // Create files
        for (const [filename, content] of Object.entries(template.files)) {
            const filePath = path.join(projectPath, filename);
            const fileDir = path.dirname(filePath);
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }
            fs.writeFileSync(filePath, content);
        }
    }

    private getTemplate(templateLabel: string, projectName: string): DocumentTemplate {
        const templates: { [key: string]: DocumentTemplate } = {
            '📄 IEEE Conference Paper': this.getIEEEConferenceTemplate(projectName),
            '📄 IEEE Journal Article': this.getIEEEJournalTemplate(projectName),
            '📚 Thesis - Standard': this.getStandardThesisTemplate(projectName),
            '📚 Thesis - Book Style': this.getBookThesisTemplate(projectName),
            '📝 Academic Article': this.getAcademicArticleTemplate(projectName),
            '📊 Research Proposal': this.getResearchProposalTemplate(projectName),
            '🎓 Dissertation': this.getDissertationTemplate(projectName),
        };

        return templates[templateLabel] || this.getAcademicArticleTemplate(projectName);
    }

    private getIEEEConferenceTemplate(projectName: string): DocumentTemplate {
        return {
            label: 'IEEE Conference Paper',
            description: 'IEEEtran class',
            detail: 'Standard IEEE conference paper format',
            files: {
                'main.tex': `\\documentclass[conference]{IEEEtran}

\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\begin{document}

\\title{${projectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}}

\\author{
    \\IEEEauthorblockN{First Author}
    \\IEEEauthorblockA{\\textit{Department} \\\\
    \\textit{University}\\\\
    City, Country \\\\
    email@example.com}
    \\and
    \\IEEEauthorblockN{Second Author}
    \\IEEEauthorblockA{\\textit{Department} \\\\
    \\textit{University}\\\\
    City, Country \\\\
    email@example.com}
}

\\maketitle

\\begin{abstract}
Your abstract goes here. This should be a concise summary of your paper, typically 150-250 words.
\\end{abstract}

\\begin{IEEEkeywords}
keyword1, keyword2, keyword3, keyword4
\\end{IEEEkeywords}

\\section{Introduction}
\\label{sec:introduction}

Your introduction goes here. Explain the problem, motivation, and contributions.

\\section{Related Work}
\\label{sec:related}

Discuss related work and how your approach differs.

\\section{Methodology}
\\label{sec:methodology}

Describe your approach and methods.

\\section{Experiments}
\\label{sec:experiments}

Present your experimental setup and results.

\\subsection{Experimental Setup}

\\subsection{Results}

\\begin{table}[htbp]
    \\centering
    \\caption{Experimental Results}
    \\label{tab:results}
    \\begin{tabular}{lcc}
        \\hline
        Method & Accuracy & Time (ms) \\\\
        \\hline
        Baseline & 0.85 & 100 \\\\
        Proposed & 0.92 & 80 \\\\
        \\hline
    \\end{tabular}
\\end{table}

\\section{Discussion}
\\label{sec:discussion}

Analyze and discuss your results.

\\section{Conclusion}
\\label{sec:conclusion}

Summarize your contributions and future work.

\\section*{Acknowledgment}
The authors would like to thank...

\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}
`,
                'references.bib': `@article{example2023,
    author = {Author, First and Author, Second},
    title = {Example Paper Title},
    journal = {Journal Name},
    year = {2023},
    volume = {1},
    pages = {1--10}
}

@inproceedings{conference2023,
    author = {Researcher, A. and Scientist, B.},
    title = {Conference Paper Example},
    booktitle = {Proceedings of Conference},
    year = {2023},
    pages = {100--110}
}
`,
                'figures/.gitkeep': ''
            }
        };
    }

    private getIEEEJournalTemplate(projectName: string): DocumentTemplate {
        return {
            label: 'IEEE Journal Article',
            description: 'IEEEtran class',
            detail: 'IEEE journal article format',
            files: {
                'main.tex': `\\documentclass[journal]{IEEEtran}

\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\begin{document}

\\title{${projectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}}

\\author{First Author,~\\IEEEmembership{Member,~IEEE,}
    Second Author,~\\IEEEmembership{Fellow,~IEEE}
    \\thanks{Manuscript received...}
    \\thanks{First Author is with the Department of...}
}

\\markboth{Journal Name, VOL. XX, NO. XX, MONTH YEAR}
{Author \\MakeLowercase{\\textit{et al.}}: Title}

\\maketitle

\\begin{abstract}
Your abstract goes here. For journal articles, this is typically 150-250 words.
\\end{abstract}

\\begin{IEEEkeywords}
keyword1, keyword2, keyword3
\\end{IEEEkeywords}

\\section{Introduction}
\\label{sec:introduction}
\\IEEEPARstart{T}{his} is the introduction to your journal article.

\\section{Background}
\\label{sec:background}

\\section{Proposed Method}
\\label{sec:method}

\\section{Experimental Results}
\\label{sec:results}

\\section{Conclusion}
\\label{sec:conclusion}

\\appendices
\\section{Proof of Theorem}

\\section*{Acknowledgment}

\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\begin{IEEEbiography}[{\\includegraphics[width=1in,height=1.25in,clip,keepaspectratio]{figures/author.png}}]{First Author}
Biography text here.
\\end{IEEEbiography}

\\end{document}
`,
                'references.bib': `@article{example2023,
    author = {Author, First and Author, Second},
    title = {Example Paper Title},
    journal = {Journal Name},
    year = {2023},
    volume = {1},
    pages = {1--10}
}
`,
                'figures/.gitkeep': ''
            }
        };
    }

    private getStandardThesisTemplate(projectName: string): DocumentTemplate {
        return {
            label: 'Thesis - Standard',
            description: 'report class',
            detail: 'Standard thesis format',
            files: {
                'main.tex': `\\documentclass[12pt,a4paper]{report}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{graphicx}
\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}
\\usepackage{hyperref}
\\usepackage{setspace}
\\usepackage[left=1.5in,right=1in,top=1in,bottom=1in]{geometry}
\\usepackage{fancyhdr}
\\usepackage{titlesec}
\\usepackage[backend=biber,style=apa]{biblatex}

\\addbibresource{references.bib}

\\onehalfspacing

\\pagestyle{fancy}
\\fancyhf{}
\\rhead{\\thepage}
\\lhead{\\leftmark}

\\title{${projectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}}
\\author{Your Name}
\\date{\\today}

\\begin{document}

% Title Page
\\input{chapters/titlepage}

% Front Matter
\\pagenumbering{roman}

\\chapter*{Abstract}
\\addcontentsline{toc}{chapter}{Abstract}
\\input{chapters/abstract}

\\chapter*{Acknowledgments}
\\addcontentsline{toc}{chapter}{Acknowledgments}
\\input{chapters/acknowledgments}

\\tableofcontents
\\listoffigures
\\listoftables

% Main Content
\\pagenumbering{arabic}

\\chapter{Introduction}
\\label{chap:introduction}
\\input{chapters/introduction}

\\chapter{Literature Review}
\\label{chap:literature}
\\input{chapters/literature}

\\chapter{Methodology}
\\label{chap:methodology}
\\input{chapters/methodology}

\\chapter{Results and Discussion}
\\label{chap:results}
\\input{chapters/results}

\\chapter{Conclusion}
\\label{chap:conclusion}
\\input{chapters/conclusion}

% Back Matter
\\printbibliography[heading=bibintoc]

\\appendix
\\chapter{Additional Materials}
\\input{chapters/appendix}

\\end{document}
`,
                'chapters/titlepage.tex': `\\begin{titlepage}
    \\centering
    \\vspace*{1cm}
    
    {\\Large University Name}\\\\[0.5cm]
    {\\large Department of Computer Science}\\\\[2cm]
    
    {\\Huge\\bfseries ${projectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}}\\\\[1cm]
    
    {\\Large A Thesis Submitted in Partial Fulfillment\\\\
    of the Requirements for the Degree of\\\\
    Master of Science}\\\\[2cm]
    
    {\\large by}\\\\[0.5cm]
    {\\Large\\bfseries Your Name}\\\\[2cm]
    
    {\\large Thesis Advisor: Dr. Advisor Name}\\\\[2cm]
    
    {\\large \\today}
    
    \\vfill
\\end{titlepage}
`,
                'chapters/abstract.tex': `Your thesis abstract goes here. This should be a comprehensive summary of your research, typically 250-350 words. Include:

\\begin{itemize}
    \\item Background and motivation
    \\item Research objectives
    \\item Methodology
    \\item Key findings
    \\item Conclusions and implications
\\end{itemize}
`,
                'chapters/acknowledgments.tex': `I would like to express my sincere gratitude to...

% Thank your advisor, committee members, family, friends, and anyone who supported your research.
`,
                'chapters/introduction.tex': `\\section{Background of the Study}
Provide context and background information here.

\\section{Statement of the Problem}
Clearly state the research problem.

\\section{Objectives of the Study}
\\subsection{General Objective}

\\subsection{Specific Objectives}
\\begin{enumerate}
    \\item First objective
    \\item Second objective
    \\item Third objective
\\end{enumerate}

\\section{Significance of the Study}
Explain the importance and potential impact of this research.

\\section{Scope and Limitations}
Define the boundaries of your study.
`,
                'chapters/literature.tex': `This chapter reviews relevant literature and theoretical frameworks.

\\section{Theoretical Framework}

\\section{Related Studies}

\\section{Synthesis}
`,
                'chapters/methodology.tex': `\\section{Research Design}
Describe the overall research approach.

\\section{Data Collection}
Explain how data will be collected.

\\section{Data Analysis}
Describe the analysis methods.

\\section{Experimental Setup}
Detail the experimental configuration.
`,
                'chapters/results.tex': `\\section{Experimental Results}
Present your findings here.

\\section{Discussion}
Analyze and interpret your results.
`,
                'chapters/conclusion.tex': `\\section{Summary of Findings}
Recap the main results.

\\section{Conclusions}
State your conclusions.

\\section{Recommendations}
Provide recommendations.

\\section{Future Work}
Suggest directions for future research.
`,
                'chapters/appendix.tex': `% Additional materials, code listings, data tables, etc.
`,
                'references.bib': `@book{example2023,
    author = {Author, First},
    title = {Book Title},
    publisher = {Publisher Name},
    year = {2023}
}
`,
                'figures/.gitkeep': ''
            }
        };
    }

    private getBookThesisTemplate(projectName: string): DocumentTemplate {
        const template = this.getStandardThesisTemplate(projectName);
        template.files['main.tex'] = template.files['main.tex'].replace(
            '\\documentclass[12pt,a4paper]{report}',
            '\\documentclass[12pt,a4paper,openright,twoside]{book}'
        );
        return template;
    }

    private getAcademicArticleTemplate(projectName: string): DocumentTemplate {
        return {
            label: 'Academic Article',
            description: 'article class',
            detail: 'Simple academic article',
            files: {
                'main.tex': `\\documentclass[12pt,a4paper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{graphicx}
\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}
\\usepackage{hyperref}
\\usepackage[backend=biber,style=apa]{biblatex}

\\addbibresource{references.bib}

\\title{${projectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}}
\\author{Your Name\\\\
\\small Department, University\\\\
\\small \\texttt{email@example.com}}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
Your abstract goes here.
\\end{abstract}

\\section{Introduction}
\\label{sec:introduction}

\\section{Methods}
\\label{sec:methods}

\\section{Results}
\\label{sec:results}

\\section{Discussion}
\\label{sec:discussion}

\\section{Conclusion}
\\label{sec:conclusion}

\\printbibliography

\\end{document}
`,
                'references.bib': `@article{example2023,
    author = {Author, First and Author, Second},
    title = {Example Paper Title},
    journal = {Journal Name},
    year = {2023}
}
`,
                'figures/.gitkeep': ''
            }
        };
    }

    private getResearchProposalTemplate(projectName: string): DocumentTemplate {
        return {
            label: 'Research Proposal',
            description: 'article class',
            detail: 'Research proposal template',
            files: {
                'main.tex': `\\documentclass[12pt,a4paper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{booktabs}
\\usepackage{hyperref}
\\usepackage[left=1in,right=1in,top=1in,bottom=1in]{geometry}
\\usepackage{setspace}
\\usepackage[backend=biber,style=apa]{biblatex}

\\addbibresource{references.bib}
\\onehalfspacing

\\title{${projectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\\\\[0.5cm]
\\large Research Proposal}
\\author{Your Name\\\\
\\small Department, University}
\\date{\\today}

\\begin{document}

\\maketitle
\\tableofcontents
\\newpage

\\section{Introduction}
\\subsection{Background}
\\subsection{Problem Statement}
\\subsection{Research Questions}

\\section{Objectives}
\\subsection{General Objective}
\\subsection{Specific Objectives}

\\section{Literature Review}

\\section{Methodology}
\\subsection{Research Design}
\\subsection{Data Collection}
\\subsection{Data Analysis}

\\section{Expected Outcomes}

\\section{Timeline}
\\begin{table}[htbp]
    \\centering
    \\caption{Research Timeline}
    \\begin{tabular}{lcccc}
        \\toprule
        Activity & Month 1-2 & Month 3-4 & Month 5-6 & Month 7-8 \\\\
        \\midrule
        Literature Review & \\checkmark & & & \\\\
        Data Collection & & \\checkmark & \\checkmark & \\\\
        Analysis & & & \\checkmark & \\checkmark \\\\
        Writing & & & & \\checkmark \\\\
        \\bottomrule
    \\end{tabular}
\\end{table}

\\section{Budget}

\\section{References}
\\printbibliography[heading=none]

\\end{document}
`,
                'references.bib': `@book{example2023,
    author = {Author, First},
    title = {Book Title},
    publisher = {Publisher},
    year = {2023}
}
`,
                'figures/.gitkeep': ''
            }
        };
    }

    private getDissertationTemplate(projectName: string): DocumentTemplate {
        const template = this.getStandardThesisTemplate(projectName);
        // Add more chapters for dissertation
        template.files['chapters/theory.tex'] = `\\section{Theoretical Background}

\\section{Conceptual Framework}
`;
        template.files['main.tex'] = template.files['main.tex'].replace(
            '\\chapter{Literature Review}',
            `\\chapter{Theoretical Framework}
\\label{chap:theory}
\\input{chapters/theory}

\\chapter{Literature Review}`
        );
        return template;
    }
}
