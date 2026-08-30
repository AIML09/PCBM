/* =========================================================
   PCBM V2 - Main Application
   JSON driven NEET Study Material
   ========================================================= */

const SUBJECTS = {
    physics: "⚛ Physics",
    chemistry: "🧪 Chemistry",
    biology: "🧬 Biology",
    mathematics: "📐 Mathematics"
};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let state = {
    subject: null,
    chapter: null,
    topic: null,
    data: null
};


/* =========================================================
   DOM
   ========================================================= */

const app = document.getElementById("app");
const searchBox = document.getElementById("search");


/* =========================================================
   JSON LOADER
   Cache-busting added so GitHub Pages does not keep
   displaying an older JSON version.
   ========================================================= */

async function loadJSON(url) {

    const separator = url.includes("?") ? "&" : "?";

    const finalURL =
        url + separator + "v=" + Date.now();

    const response = await fetch(finalURL);

    if (!response.ok) {

        throw new Error(
            `Cannot load ${url} (${response.status})`
        );

    }

    return await response.json();
}


/* =========================================================
   HOME
   ========================================================= */

function showHome() {

    state = {
        subject: null,
        chapter: null,
        topic: null,
        data: null
    };

    app.innerHTML = `

        <div class="home-title">

            <h1>📚 PCBM V2</h1>

            <p>
                Complete NEET Study Material
            </p>

        </div>


        <div class="subjects">

            ${Object.entries(SUBJECTS)
                .map(([id, name]) => `

                    <button
                        class="subject"
                        onclick="loadSubject('${id}')"
                    >

                        ${name}

                    </button>

                `)
                .join("")}

        </div>

    `;
}


/* =========================================================
   LOAD SUBJECT
   ========================================================= */

async function loadSubject(subject) {

    try {

        state = {
            subject: subject,
            chapter: null,
            topic: null,
            data: null
        };

        app.innerHTML = `

            <div class="loading">

                Loading ${SUBJECTS[subject]}...

            </div>

        `;


        const chapters = await loadJSON(
            `data/${subject}/chapters.json`
        );


        app.innerHTML = `

            <button
                class="back-button"
                onclick="showHome()"
            >
                ← Home
            </button>


            <h1>
                ${SUBJECTS[subject]}
            </h1>


            <p>
                Select a chapter
            </p>


            <div class="chapter-grid">

                ${
                    chapters.map((chapter, index) => `

                        <div
                            class="chapter"
                            onclick="
                                loadChapter(
                                    '${subject}',
                                    '${chapter.id}'
                                )
                            "
                        >

                            <h3>

                                ${index + 1}.
                                ${escapeHTML(
                                    chapter.name
                                )}

                            </h3>


                            <p>

                                ${
                                    chapter.subchapters ||
                                    "Multiple"
                                }
                                subchapters

                            </p>

                        </div>

                    `).join("")
                }

            </div>

        `;

    }

    catch (error) {

        showError(error);

    }

}


/* =========================================================
   LOAD CHAPTER
   ========================================================= */

async function loadChapter(
    subject,
    chapterId
) {

    try {

        app.innerHTML = `

            <div class="loading">
                Loading chapter...
            </div>

        `;


        const data = await loadJSON(
            `data/${subject}/${chapterId}.json`
        );


        state.subject = subject;
        state.chapter = chapterId;
        state.data = data;
        state.topic = null;


        const topics =
            Array.isArray(data.subchapters)
            ? data.subchapters
            : [];


        app.innerHTML = `

            <button
                class="back-button"
                onclick="
                    loadSubject('${subject}')
                "
            >
                ← Chapters
            </button>


            <h1>
                ${escapeHTML(
                    data.name ||
                    data.title ||
                    chapterId
                )}
            </h1>


            <p>
                Select a subchapter
            </p>


            <div class="topic-grid">

                ${
                    topics.map((topic, index) => `

                        <div
                            class="topic"
                            onclick="
                                loadTopic(${index})
                            "
                        >

                            <b>

                                ${index + 1}.
                                ${escapeHTML(
                                    topic.title ||
                                    topic.name ||
                                    "Topic"
                                )}

                            </b>


                            <br>


                            <small>

                                📖 Theory
                                • 📐 Formula
                                • 🧮 Derivation
                                • 💡 Examples
                                • 📊 Graph
                                • 🖼 Diagram
                                • ❓ MCQ
                                • ⚡ Revision

                            </small>

                        </div>

                    `).join("")
                }

            </div>

        `;

    }

    catch (error) {

        showError(error);

    }

}


/* =========================================================
   LOAD TOPIC
   ========================================================= */

function loadTopic(index) {

    state.topic = index;


    const topic =
        state.data.subchapters[index];


    app.innerHTML = `

        <button
            class="back-button"
            onclick="
                loadChapter(
                    state.subject,
                    state.chapter
                )
            "
        >
            ← Subchapters
        </button>


        <h1>
            ${escapeHTML(
                topic.title ||
                topic.name ||
                "Topic"
            )}
        </h1>


        <div class="tabs">

            <button onclick="renderTab('Theory')">
                📖 Theory
            </button>

            <button onclick="renderTab('Key Points')">
                📌 Key Points
            </button>

            <button onclick="renderTab('Formula')">
                📐 Formula
            </button>

            <button onclick="renderTab('Derivation')">
                🧮 Derivation
            </button>

            <button onclick="renderTab('Examples')">
                💡 Examples
            </button>

            <button onclick="renderTab('Graph')">
                📊 Graph
            </button>

            <button onclick="renderTab('Diagram')">
                🖼 Diagram
            </button>

            <button onclick="renderTab('MCQ')">
                ❓ MCQ
            </button>

            <button onclick="renderTab('Quick Revision')">
                ⚡ Quick Revision
            </button>

        </div>


        <div
            id="content"
            class="content"
        ></div>

    `;


    renderTab("Theory");

}


/* =========================================================
   GET CURRENT TOPIC
   ========================================================= */

function getCurrentTopic() {

    if (
        !state.data ||
        !Array.isArray(state.data.subchapters)
    ) {

        return null;

    }

    return state.data.subchapters[state.topic];

}


/* =========================================================
   RENDER TAB
   ========================================================= */

function renderTab(tab) {

    const topic = getCurrentTopic();

    const content =
        document.getElementById("content");


    if (!topic || !content) {

        return;

    }


    /* =====================================================
       THEORY
       ===================================================== */

    if (tab === "Theory") {

        content.innerHTML = `

            <h2>📖 Complete Theory</h2>

            <div>

                ${
                    formatText(
                        topic.theory ||
                        "Theory is not available yet."
                    )
                }

            </div>

        `;

        return;
    }


    /* =====================================================
       KEY POINTS
       ===================================================== */

    if (tab === "Key Points") {

        content.innerHTML = `

            <h2>📌 Key Points</h2>

            ${
                createList(
                    topic.key_points
                )
            }

        `;

        return;
    }


    /* =====================================================
       FORMULAS
       ===================================================== */

    if (tab === "Formula") {

        const formulas =
            Array.isArray(topic.formulas)
            ? topic.formulas
            : [];


        content.innerHTML = `

            <h2>📐 Formula Sheet</h2>

            ${
                formulas.length

                ?

                formulas.map(
                    (formula, index) => `

                        <div class="formula">

                            <b>

                                ${index + 1}.
                                ${escapeHTML(
                                    formula.name ||
                                    "Formula"
                                )}

                            </b>


                            <div
                                class="formula-text"
                            >

                                ${escapeHTML(
                                    formula.formula ||
                                    ""
                                )}

                            </div>


                            <small>

                                Unit:
                                ${escapeHTML(
                                    formula.unit ||
                                    "-"
                                )}

                            </small>

                        </div>

                    `
                ).join("")

                :

                "<p>No formulas available.</p>"
            }

        `;

        return;
    }


    /* =====================================================
       DERIVATION
       ===================================================== */

    if (tab === "Derivation") {

        const derivations =
            Array.isArray(topic.derivations)
            ? topic.derivations
            : [];


        content.innerHTML = `

            <h2>
                🧮 Step-by-Step Derivation
            </h2>

            ${
                derivations.length

                ?

                derivations.map(
                    (step, index) => `

                        <div class="derivation">

                            <h3>
                                Step ${index + 1}
                            </h3>

                            <p>

                                ${formatText(step)}

                            </p>

                        </div>

                    `
                ).join("")

                :

                `
                    <div class="error">

                        Derivation has not yet
                        been added for this topic.

                    </div>
                `
            }

        `;

        return;
    }


    /* =====================================================
       EXAMPLES
       ===================================================== */

    if (tab === "Examples") {

        const examples =
            Array.isArray(topic.examples)
            ? topic.examples
            : [];


        content.innerHTML = `

            <h2>
                💡 Solved Examples
            </h2>

            ${
                examples.length

                ?

                examples.map(
                    (example, index) => `

                        <div class="example">

                            <h3>

                                Example ${index + 1}

                            </h3>


                            <b>

                                ${escapeHTML(
                                    example.question ||
                                    ""
                                )}

                            </b>


                            <p>

                                ${formatText(
                                    example.solution ||
                                    ""
                                )}

                            </p>

                        </div>

                    `
                ).join("")

                :

                "<p>No examples available.</p>"
            }

        `;

        return;
    }


    /* =====================================================
       GRAPH
       ===================================================== */

    if (tab === "Graph") {

        renderVisual(
            content,
            topic.graph,
            "📊 Graph",
            "Physics graph"
        );

        return;
    }


    /* =====================================================
       DIAGRAM
       ===================================================== */

    if (tab === "Diagram") {

        renderVisual(
            content,
            topic.diagram,
            "🖼 Diagram",
            "Physics diagram"
        );

        return;
    }


    /* =====================================================
       MCQ
       ===================================================== */

    if (tab === "MCQ") {

        const questions =
            Array.isArray(topic.mcqs)
            ? topic.mcqs
            : [];


        content.innerHTML = `

            <h2>
                ❓ NEET Practice MCQs
            </h2>

            ${
                questions.length

                ?

                questions.map(
                    (question, index) =>
                        createMCQ(
                            question,
                            index
                        )
                ).join("")

                :

                "<p>No MCQs available.</p>"
            }

        `;

        return;
    }


    /* =====================================================
       QUICK REVISION
       ===================================================== */

    if (tab === "Quick Revision") {

        const revision =
            topic.revision ||
            topic.quick_revision ||
            [];


        content.innerHTML = `

            <h2>
                ⚡ Quick Revision
            </h2>

            ${
                createList(revision)
            }

        `;

        return;
    }

}


/* =========================================================
   VISUAL
   ========================================================= */

function renderVisual(
    content,
    path,
    title,
    alt
) {

    if (!path) {

        content.innerHTML = `

            <h2>${title}</h2>

            <div class="error">

                No image has been assigned
                to this topic.

            </div>

        `;

        return;

    }


    const cleanPath =
        normaliseAssetPath(path);


    content.innerHTML = `

        <h2>
            ${title}
        </h2>


        <div>

            <img
                class="visual"
                src="${cleanPath}"
                alt="${alt}"
                onerror="
                    imageError(
                        this,
                        '${escapeAttribute(cleanPath)}'
                    )
                "
            >

        </div>

    `;

}


/* =========================================================
   IMAGE ERROR
   ========================================================= */

function imageError(
    image,
    path
) {

    image.outerHTML = `

        <div class="error">

            ⚠️ Image not found.

            <br><br>

            Expected:

            <br>

            <code>
                ${escapeHTML(path)}
            </code>

        </div>

    `;

}


/* =========================================================
   MCQ
   ========================================================= */

function createMCQ(
    question,
    index
) {

    const q =
        question.q ||
        question.question ||
        "Question";


    const options =
        Array.isArray(question.options)
        ? question.options
        : [];


    const answer =
        Number.isInteger(question.answer)
        ? question.answer
        : 0;


    return `

        <div
            class="mcq"
            id="mcq-${index}"
        >

            <h3>

                Q${index + 1}.
                ${escapeHTML(q)}

            </h3>


            ${
                options.map(
                    (option, optionIndex) => `

                        <button
                            class="option"
                            onclick="
                                checkMCQ(
                                    ${index},
                                    ${optionIndex},
                                    ${answer}
                                )
                            "
                        >

                            ${
                                String.fromCharCode(
                                    65 + optionIndex
                                )
                            }.

                            ${escapeHTML(option)}

                        </button>

                    `
                ).join("")
            }


            <div
                id="answer-${index}"
            ></div>

        </div>

    `;

}


/* =========================================================
   MCQ CHECK
   ========================================================= */

function checkMCQ(
    questionIndex,
    selected,
    correct
) {

    const topic =
        getCurrentTopic();


    if (!topic || !topic.mcqs) {

        return;

    }


    const question =
        topic.mcqs[questionIndex];


    const answerBox =
        document.getElementById(
            `answer-${questionIndex}`
        );


    if (!answerBox) {

        return;

    }


    const explanation =
        question.explanation ||
        "No explanation available.";


    if (selected === correct) {

        answerBox.innerHTML = `

            <div class="answer">

                ✅ <b>Correct!</b>

                <br><br>

                ${formatText(explanation)}

            </div>

        `;

    }

    else {

        answerBox.innerHTML = `

            <div class="answer">

                ❌ <b>Incorrect</b>

                <br>

                Correct answer:

                <b>

                    ${
                        String.fromCharCode(
                            65 + correct
                        )
                    }

                </b>


                <br><br>


                ${formatText(explanation)}

            </div>

        `;

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

if (searchBox) {

    searchBox.addEventListener(
        "input",
        performSearch
    );

}


async function performSearch(event) {

    const query =
        event.target.value
            .trim()
            .toLowerCase();


    if (!query) {

        showHome();

        return;

    }


    const results = [];


    for (
        const subject
        of Object.keys(SUBJECTS)
    ) {

        try {

            const chapters =
                await loadJSON(
                    `data/${subject}/chapters.json`
                );


            chapters.forEach(chapter => {

                if (
                    String(
                        chapter.name || ""
                    )
                    .toLowerCase()
                    .includes(query)
                ) {

                    results.push({
                        subject,
                        chapter
                    });

                }

            });

        }

        catch (error) {

            console.error(
                "Search error:",
                error
            );

        }

    }


    app.innerHTML = `

        <button
            class="back-button"
            onclick="showHome()"
        >
            ← Home
        </button>


        <h1>
            🔎 Search Results
        </h1>


        ${
            results.length

            ?

            `
                <div class="chapter-grid">

                    ${
                        results.map(
                            result => `

                                <div
                                    class="chapter"
                                    onclick="
                                        loadChapter(
                                            '${result.subject}',
                                            '${result.chapter.id}'
                                        )
                                    "
                                >

                                    <b>

                                        ${
                                            SUBJECTS[
                                                result.subject
                                            ]
                                        }

                                    </b>


                                    <h3>

                                        ${escapeHTML(
                                            result.chapter.name
                                        )}

                                    </h3>

                                </div>

                            `
                        ).join("")
                    }

                </div>
            `

            :

            `
                <div class="error">

                    No chapter found.

                </div>
            `
        }

    `;

}


/* =========================================================
   LIST
   ========================================================= */

function createList(items) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return `
            <p>
                No information available.
            </p>
        `;

    }


    return `

        <ul>

            ${
                items.map(
                    item => `

                        <li>

                            ${formatText(item)}

                        </li>

                    `
                ).join("")
            }

        </ul>

    `;

}


/* =========================================================
   TEXT FORMAT
   ========================================================= */

function formatText(text) {

    if (
        text === undefined ||
        text === null
    ) {

        return "";

    }


    return escapeHTML(
        String(text)
    )
    .replace(/\n/g, "<br>");

}


/* =========================================================
   PATH NORMALISATION
   ========================================================= */

function normaliseAssetPath(path) {

    if (!path) {

        return "";

    }


    let clean =
        String(path)
        .replace(/\\/g, "/");


    clean =
        clean.replace(
            /^\.?\//,
            ""
        );


    /*
       Paths in your JSON are already like:

       assets/physics/graphs/...
       assets/physics/diagrams/...

       Therefore we use them directly from
       the repository root.
    */


    return clean;

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


function escapeAttribute(value) {

    return escapeHTML(value)
        .replace(/`/g, "&#096;");

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(error) {

    console.error(error);


    app.innerHTML = `

        <div class="error">

            <h2>
                ⚠️ Unable to load content
            </h2>


            <p>

                ${escapeHTML(
                    error.message
                )}

            </p>


            <p>

                Check the JSON path and
                GitHub Pages deployment.

            </p>


            <button
                class="back-button"
                onclick="showHome()"
            >
                ← Home
            </button>

        </div>

    `;

}


/* =========================================================
   START
   ========================================================= */

showHome();
