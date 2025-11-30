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
            { label: '🎓 COE198 Research Proposal', description: 'Rho class (MSU-IIT)', detail: 'COE198 Research Methods proposal template' },
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

        // Create files - handle cross-platform paths
        for (const [filename, content] of Object.entries(template.files)) {
            // Convert forward slashes to platform-specific separator
            const normalizedFilename = filename.split('/').join(path.sep);
            const filePath = path.join(projectPath, normalizedFilename);
            const fileDir = path.dirname(filePath);
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }

    private getTemplate(templateLabel: string, projectName: string): DocumentTemplate {
        const templates: { [key: string]: DocumentTemplate } = {
            '🎓 COE198 Research Proposal': this.getCOE198Template(projectName),
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

    private getCOE198Template(projectName: string): DocumentTemplate {
        return {
            label: 'COE198 Research Proposal',
            description: 'Rho class (MSU-IIT)',
            detail: 'COE198 Research Methods proposal template',
            files: {
                'main.tex': `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% COE198 Research Proposal Template
% Based on Rho LaTeX Template Version 2.1.1
% License: Creative Commons CC BY 4.0
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\documentclass[9pt,a4paper,twoside]{rho-class/rho}
\\usepackage[english]{babel}
\\usepackage{pgfgantt}

% Landscape pages
\\usepackage{pdflscape}
\\usepackage{fancyhdr} 
\\fancypagestyle{mylandscape}{
\\fancyhf{}
\\fancyfoot{%
\\makebox[\\textwidth][r]{%
  \\rlap{\\hspace{.75cm}%
    \\smash{%
      \\raisebox{4.87in}{%
        \\rotatebox{90}{\\thepage}}}}}}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
}

\\usepackage{rotating}
\\usepackage{tikz}

\\setbool{rho-abstract}{true}
\\setbool{corres-info}{false}

%----------------------------------------------------------
% TITLE
%----------------------------------------------------------

\\journalname{COE198 Research Methods | Proposal}
\\title{${projectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}}

%----------------------------------------------------------
% AUTHORS AND AFFILIATIONS
%----------------------------------------------------------

\\author[1]{Your Name}
\\author[2]{Adviser Name}

\\affil[1]{Student Researcher}
\\affil[2]{Faculty Adviser, Department of Computer Engineering and Mechatronics, MSU-IIT}

%----------------------------------------------------------
% DATES
%----------------------------------------------------------

\\dates{This manuscript was compiled on \\today}

%----------------------------------------------------------
% FOOTER INFORMATION
%----------------------------------------------------------

\\leadauthor{Your Last Name}
\\footinfo{Creative Commons CC BY 4.0}
\\smalltitle{COE198 Research Methods}
\\institution{College of Engineering, MSU-IIT}

%----------------------------------------------------------
% ABSTRACT
%----------------------------------------------------------

\\begin{abstract}
    This section provides a concise overview of the proposed research. An abstract is a brief statement outlining the research focus, a snapshot of the methodology, and a rationale for its importance. It should be succinct yet compelling (150-250 words).
\\end{abstract}

\\keywords{keyword 1, keyword 2, keyword 3, keyword 4, keyword 5}

%----------------------------------------------------------

\\begin{document}

\\maketitle
\\thispagestyle{firststyle}
\\tableofcontents
\\linenumbers

%----------------------------------------------------------

\\section{INTRODUCTION}
    
\\rhostart{T}his chapter sets the foundation for the research by providing a clear context, problem statement, justification, objectives, and research questions.

\\subsection{Background of the Study}
\\begin{itemize}
    \\item Demonstrate a clear understanding of the problem's origin and evolution.
    \\item Identify specific gaps considered to be the root of the problem, supported by evidence.
    \\item Limit this section to a maximum of 5 paragraphs.
    \\item Begin with a global perspective of the issue, then narrow it down to the local scenario.
\\end{itemize}

\\subsection{Statement of the Problem}
\\begin{itemize}
    \\item Clearly define the exact nature of the problem.
    \\item Explain why and how it constitutes a problem, using supporting data.
    \\item Ensure connectivity with the background information.
    \\item Limit this section to a maximum of two paragraphs.
\\end{itemize}

\\subsection{Research Questions}
\\begin{enumerate}[1.]
    \\item Research question 1?
    \\item Research question 2?
    \\item Research question 3?
\\end{enumerate}

\\subsection{Objectives of the Study}

\\subsubsection*{General Objective}
State one overarching objective aligned with the title of the research.

\\subsubsection*{Specific Objectives}
\\begin{enumerate}[1.]
    \\item Specific objective 1
    \\item Specific objective 2
    \\item Specific objective 3
\\end{enumerate}

\\subsection{Originality of the Study}
Highlight and articulate the unique contributions and novel aspects of the research.

\\subsection{Significance of the Study}
\\begin{itemize}
    \\item Explain why the research is being conducted and identify key beneficiaries.
    \\item Highlight the significance of addressing the problem.
    \\item Connect the research to its impact on the United Nations Sustainable Development Goals (UN SDGs).
\\end{itemize}

\\subsection{Scope and Limitations}

\\subsubsection{Scope}
Outline the boundaries and constraints of the study.

\\subsubsection{Limitations}
\\begin{enumerate}
    \\item Limitation 1
    \\item Limitation 2
\\end{enumerate}

\\subsection{Conceptual Framework}
Provide a conceptualized view of the study problem if suitable.

%----------------------------------------------------------

\\section{REVIEW OF RELATED LITERATURE}

\\subsection{Related Studies}
Review relevant literature and previous studies.

\\subsection{Synthesis}
Synthesize the literature and identify gaps.

%----------------------------------------------------------

\\section{METHODOLOGY}

\\subsection{Research Design}
Describe the overall research approach.

\\subsection{Participants/Subjects}
Define the study population and sampling method.

\\subsection{Instruments}
Describe data collection tools.

\\subsection{Data Collection}
Detail the process of collecting data.

\\subsection{Data Management and Analysis}
Specify the methods for managing and analyzing data.

\\subsection{Ethical Considerations}
Address ethical issues (e.g., informed consent, confidentiality).

%----------------------------------------------------------

\\section{WORKPLAN}
Provide a timeline of research activities (e.g., Gantt chart).

% Include your Gantt chart figure here
% \\begin{figure}[ht!]
%     \\includegraphics[width=\\linewidth]{figures/gantt_chart.pdf}
%     \\caption{Research Plan Gantt Chart}
%     \\label{fig:gantt_chart}
% \\end{figure}

%----------------------------------------------------------

\\section{BUDGET}
Present a detailed budget, including costs for personnel, materials, travel, and other resources.

\\begin{table}[htbp]
    \\centering
    \\caption{Research Budget}
    \\begin{tabular}{lrr}
        \\toprule
        \\textbf{Item} & \\textbf{Quantity} & \\textbf{Cost (PHP)} \\\\
        \\midrule
        Materials & -- & -- \\\\
        Equipment & -- & -- \\\\
        Travel & -- & -- \\\\
        Other & -- & -- \\\\
        \\midrule
        \\textbf{Total} & & \\textbf{--} \\\\
        \\bottomrule
    \\end{tabular}
\\end{table}

%----------------------------------------------------------

\\section{APPENDICES}
Include supplementary materials such as:
\\begin{itemize}
    \\item Instruments (questionnaire, interview schedule, consent form)
    \\item Copy of ethical approval letter
\\end{itemize}

%----------------------------------------------------------

\\printbibliography

\\end{document}
`,
                'bibliography.bib': `@Article{Sample2024,
    author = {Sample, Ex},
    title = {An example reference for a single author article},
    journal = {Journal of Sample Articles},
    year = {2024},
    volume = {1},
    number = {1},
    pages = {1-23},
}

@Article{Multiauthor2020,
    author = {First-Author, The and Author, Second and Third, Author The},
    title = {An example article with multiple authors},
    journal = {Competing Sample Article Journal},
    year = {2020},
    volume = {2},
    number = {4},
    pages = {6-8},
}

@Book{FullBook2021,
    author = {Book Author, Fancy Pants},
    title = {{Fancy Pants Whole Book}},
    publisher = {So \\& Fancy Publishing},
    year = {2021},
    address = {New York},
}
`,
                'rho-class/rho.cls': this.getRhoClassContent(),
                'rho-class/rhobabel.sty': this.getRhoBabelContent(),
                'rho-class/rhoenvs.sty': this.getRhoEnvsContent(),
                'figures/.gitkeep': '',
            }
        };
    }

    private getRhoClassContent(): string {
        return `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Rho LaTeX Class - Version 2.1.1 (01/09/2024)
% Authors: Guillermo Jimenez, Eduardo Gracidas
% License: Creative Commons CC BY 4.0
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\NeedsTeXFormat{LaTeX2e}
\\ProvidesClass{rho-class/rho}[2024/09/01 Rho LaTeX class]
\\DeclareOption*{\\PassOptionsToClass{\\CurrentOption}{extarticle}}
\\ProcessOptions\\relax
\\LoadClass[twocolumn]{extarticle}
\\AtEndOfClass{\\RequirePackage{microtype}}

% Required packages
\\RequirePackage[utf8]{inputenc}
\\RequirePackage{etoolbox}
\\RequirePackage[framemethod=tikz]{mdframed}
\\RequirePackage{titling}
\\RequirePackage{lettrine}
\\RequirePackage[switch]{lineno}
\\RequirePackage{microtype}
\\RequirePackage[bottom,hang,flushmargin,ragged]{footmisc}
\\RequirePackage{fancyhdr}
\\RequirePackage{xifthen}
\\RequirePackage{adjustbox}
\\RequirePackage{adforn}
\\RequirePackage{lastpage}
\\RequirePackage[explicit]{titlesec}
\\RequirePackage{booktabs}
\\RequirePackage{array}
\\RequirePackage{caption}
\\RequirePackage{setspace}
\\RequirePackage{iflang}
\\RequirePackage{listings}
\\RequirePackage{lipsum}
\\RequirePackage{fontawesome5}
\\RequirePackage{supertabular}
\\RequirePackage{csquotes}
\\RequirePackage{ragged2e}
\\RequirePackage{ccicons}
\\RequirePackage{subcaption}
\\RequirePackage{stfloats}
\\RequirePackage{authblk}
\\RequirePackage[figuresright]{rotating}

% Custom packages
\\RequirePackage{rho-class/rhobabel}
\\RequirePackage{rho-class/rhoenvs}

% Booleans
\\newbool{corres-info}
\\newbool{rho-abstract}

% Page layout
\\RequirePackage[
    left=1.5cm,
    right=1.5cm,
    top=2cm,
    bottom=2cm,
    headsep=0.75cm
]{geometry}

% Colors
\\RequirePackage{xcolor}
\\definecolor{rhocolor}{RGB}{0,90,120}
\\definecolor{rhored}{RGB}{180,30,30}
\\definecolor{rholightblue}{RGB}{0,105,170}

% Hyperref
\\RequirePackage[colorlinks=true,allcolors=rholightblue]{hyperref}

% Fonts
\\RequirePackage{stix2}
\\RequirePackage[scaled=0.9]{inconsolata}

% Bibliography
\\RequirePackage[
    backend=biber,
    style=apa,
    sorting=nyt,
]{biblatex}
\\addbibresource{bibliography.bib}

% Commands
\\newcommand{\\journalname}[1]{\\def\\@journalname{#1}}
\\newcommand{\\dates}[1]{\\def\\@dates{#1}}
\\newcommand{\\leadauthor}[1]{\\def\\@leadauthor{#1}}
\\newcommand{\\footinfo}[1]{\\def\\@footinfo{#1}}
\\newcommand{\\smalltitle}[1]{\\def\\@smalltitle{#1}}
\\newcommand{\\institution}[1]{\\def\\@institution{#1}}
\\newcommand{\\corres}[1]{\\def\\@corres{#1}}
\\newcommand{\\email}[1]{\\def\\@email{#1}}
\\newcommand{\\doi}[1]{\\def\\@doi{#1}}
\\newcommand{\\received}[1]{\\def\\@received{#1}}
\\newcommand{\\revised}[1]{\\def\\@revised{#1}}
\\newcommand{\\accepted}[1]{\\def\\@accepted{#1}}
\\newcommand{\\published}[1]{\\def\\@published{#1}}
\\newcommand{\\license}[1]{\\def\\@license{#1}}

% Defaults
\\journalname{Journal Name}
\\dates{\\today}
\\leadauthor{Author}
\\footinfo{}
\\smalltitle{Title}
\\institution{Institution}
\\corres{}
\\email{}
\\doi{}
\\received{}
\\revised{}
\\accepted{}
\\published{}
\\license{}

% Lettrine command
\\newcommand{\\rhostart}[1]{\\lettrine[lines=2,lhang=0.15,nindent=0em]{\\color{rhocolor}#1}}

% Title formatting
\\pretitle{\\begin{flushleft}\\huge\\bfseries\\color{rhocolor}}
\\posttitle{\\end{flushleft}}
\\preauthor{\\begin{flushleft}\\large}
\\postauthor{\\end{flushleft}}
\\predate{\\begin{flushleft}\\small}
\\postdate{\\end{flushleft}}

% Section formatting
\\titleformat{\\section}
    {\\large\\bfseries\\color{rhocolor}}
    {\\thesection}{1em}{#1}
\\titleformat{\\subsection}
    {\\normalsize\\bfseries}
    {\\thesubsection}{1em}{#1}
\\titleformat{\\subsubsection}
    {\\normalsize\\itshape}
    {\\thesubsubsection}{1em}{#1}

% Header/footer
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[LE,RO]{\\thepage}
\\fancyhead[RE]{\\small\\@smalltitle}
\\fancyhead[LO]{\\small\\@leadauthor}
\\renewcommand{\\headrulewidth}{0.4pt}
\\fancyfoot[C]{\\small\\@institution}

\\fancypagestyle{firststyle}{
    \\fancyhf{}
    \\fancyhead[L]{\\small\\@journalname}
    \\fancyhead[R]{\\small\\@dates}
    \\fancyfoot[C]{\\small\\@institution\\\\ \\@footinfo}
    \\renewcommand{\\headrulewidth}{0.4pt}
}

% Abstract environment
\\renewenvironment{abstract}{%
    \\ifbool{rho-abstract}{%
        \\small
        \\begin{mdframed}[
            linewidth=0.5pt,
            linecolor=rhocolor,
            backgroundcolor=rhocolor!5,
            innerleftmargin=10pt,
            innerrightmargin=10pt,
            innertopmargin=10pt,
            innerbottommargin=10pt
        ]
        \\noindent\\textbf{\\abstractname}\\\\
    }{\\comment}
}{%
    \\ifbool{rho-abstract}{%
        \\end{mdframed}
    }{\\endcomment}
}

% Keywords
\\newcommand{\\keywords}[1]{%
    \\vspace{0.5em}
    \\noindent{\\small\\textbf{Keywords:} #1}
    \\vspace{1em}
}

% Caption setup
\\captionsetup{font=small,labelfont=bf}

\\endinput
`;
    }

    private getRhoBabelContent(): string {
        return `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Rho Babel Package
% Version 2.1.1 (01/09/2024)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{rho-class/rhobabel}[2024/09/01 Rho babel customization]

% Language-specific settings
\\addto\\captionsenglish{%
    \\renewcommand{\\abstractname}{Abstract}%
    \\renewcommand{\\contentsname}{Contents}%
    \\renewcommand{\\listfigurename}{List of Figures}%
    \\renewcommand{\\listtablename}{List of Tables}%
    \\renewcommand{\\refname}{References}%
    \\renewcommand{\\bibname}{Bibliography}%
    \\renewcommand{\\appendixname}{Appendix}%
}

\\endinput
`;
    }

    private getRhoEnvsContent(): string {
        return `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Rho Environments Package
% Version 2.1.1 (01/09/2024)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{rho-class/rhoenvs}[2024/09/01 Rho environments]

\\RequirePackage{enumitem}

% Customize lists
\\setlist[itemize]{leftmargin=*,nosep}
\\setlist[enumerate]{leftmargin=*,nosep}

% Unnumbered list environment
\\newenvironment{unlist}{%
    \\begin{list}{}{%
        \\setlength{\\leftmargin}{1em}%
        \\setlength{\\itemsep}{0pt}%
        \\setlength{\\parskip}{0pt}%
        \\setlength{\\parsep}{0pt}%
    }
}{%
    \\end{list}
}

% Table note command
\\newcommand{\\tabletext}[1]{%
    \\par\\vspace{0.5em}
    {\\small #1}
}

\\endinput
`;
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
