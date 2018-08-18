
/* --- /Users/Ryan/Desktop/LazyScript/1.1.0/lib/common.saur --- */
const println = (message) => { console.log(message
);
 }



const makeTitle = (todos) => { return todos.length
 + " Todos\n----------"

;
 }
const drawTodos = (title) => (todos) => { println(title
);
for (let i = 0; i < todos.length
; i++) { println(todos[i
]
);
 };
println("\n\n"
);
 }
const appLoop = (data = ["Task 1"
, "Task 2"
, "Task 3"
]
) => (draw = drawTodos
) => { const title = makeTitle(data
);
;
draw(title
)(data
);
return [data
, draw
]
;
 }
if (appLoop) { let loopParams = []; setInterval(_ => { appLoop().apply(this, loopParams); }, 0.1); }