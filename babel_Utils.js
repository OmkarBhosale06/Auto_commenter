// utils.js
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function generateComment(functionName, description) {
    return `/**
    * ${functionName}
    * description - ${description}
    */`;
}

function autoComment(code) {
    const ast = parser.parse(code, { sourceType: 'module' });

    traverse(ast, {
        FunctionDeclaration(path) {
            console.log(path.node.id.name, 'path here---')
            const funcName = path.node.id.name;
            let node = path.node;
            const description = generateFunctionDescription(path?.node?.body, path.node.params);
            // const params = path.node.params.map(param => param.name);
            const comment = generateComment(funcName, description);
            path.addComment('leading', comment);
        },
    });

    const { code: modifiedCode } = require('@babel/generator').default(ast);
    return modifiedCode;
}

// const generateFunctionDescription = (body, params) => {
//     let description = "";
//     const paramNames = params.map(param => param.name);

//     body.body.forEach(node => {
//         switch (node.type) {
//             case "VariableDeclaration":
//                 node.declarations.forEach(declaration => {
//                     if (declaration.init && declaration.init.type === "BinaryExpression") {
//                         const left = declaration.init.left.name || "unknown";
//                         const right = declaration.init.right.name || "unknown";
//                         const operator = declaration.init.operator;

//                         description += `Performs a calculation: ${left} ${operator} ${right}. `;
//                     }
//                 });
//                 break;

//             case "ExpressionStatement":
//                 if (node.expression.type === "CallExpression") {
//                     const Node = traversePromiseChain(node.expression)
//                     const callee = node.expression.callee;

//                     if (callee.type === "Identifier") {
//                         // Handle API or general function calls
//                         if (["fetch", "axios", "http"].includes(callee.name)) {
//                             description += "Makes an API call. ";
//                         } else {
//                             description += `Calls the function ${callee.name}. `;
//                         }
//                     } else if (callee.type === "MemberExpression") {
//                         const object = callee.object.name;
//                         const property = callee.property.name;

//                         // Handle database queries
//                         if (["db", "database", "mongoose",].includes(object)) {
//                             description += `Queries the database using ${object}.${property}. `;
//                         } else if("fetch", "axios", "http"){
//                             description += `Calls the method ${property} on ${object}. `;
//                         }
//                     }
//                 }
//                 break;

//             case "ReturnStatement":
//                 if (node.argument.type === "Identifier") {
//                     description += `Returns the value of ${node.argument.name}. `;
//                 }
//                 break;

//             case "IfStatement":
//                 description += "Contains conditional logic. ";
//                 break;

//             case "ForStatement":
//             case "WhileStatement":
//                 description += "Includes a loop structure. ";
//                 break;

//             // Add more cases for different node types if needed
//             default:
//                 break;
//         }
//     });

//     // Finalize the description
//     if (!description) {
//         description = "Performs operations and returns a result.";
//     } else {
//         description = `This function ${description.toLowerCase()}`;
//         if (paramNames.length > 0) {
//             description += ` It uses the parameters: ${paramNames.join(", ")}.`;
//         }
//     }

//     return description;
// };

const generateFunctionDescription = async (body, params) => {
    let description = "";
    const paramNames = params.map(param => param.name);

    body.body.forEach(node => {
        switch (node.type) {
            case "VariableDeclaration":
                node.declarations.forEach(declaration => {
                    if (declaration.init && declaration.init.type === "BinaryExpression") {
                        const left = declaration.init.left.name || "unknown";
                        const right = declaration.init.right.name || "unknown";
                        const operator = declaration.init.operator;

                        description += `Performs a calculation: ${left} ${operator} ${right}. `;
                    }
                });
                break;

            case "ExpressionStatement":
                if (node.expression.type === "CallExpression") {
                    const promiseChain = traversePromiseChain(node.expression);
                    const callee = node.expression.callee;

                    if (callee.type === "Identifier") {
                        // Handle API or general function calls
                        if (["fetch", "axios", "http"].includes(callee.name)) {
                            description += "Makes an API call. ";
                        } else {
                            description += `Calls the function ${callee.name}. `;
                        }
                    }
                    // else if (callee.type === "MemberExpression") {
                    //     const object = callee.object.name;
                    //     const property = callee.property.name;

                    //     // Handle database queries
                    //     if (["db", "database", "mongoose"].includes(object)) {
                    //         description += `Queries the database using ${object}.${property}. `;
                    //     } else if (["fetch", "axios", "http"].includes(object)) {
                    //         description += `Calls the method ${property} on ${object}. `;
                    //     } else {
                    //         description += `Calls the method ${property} on ${object}. `;
                    //     }
                    // }

                    // Describe the promise chain if it exists
                    if (promiseChain.length > 0) {
                        description += `use the promise chain includes: ${promiseChain.join(", ")}. `;
                    }
                }
                break;

            case "ReturnStatement":
                if (node.argument.type === "Identifier") {
                    description += `Returns the value of ${node.argument.name}. `;
                }
                break;

            case "IfStatement":
                description += "Contains conditional logic. ";
                break;

            case "ForStatement":
            case "WhileStatement":
                description += "Includes a loop structure. ";
                break;

            // Add more cases for different node types if needed
            default:
                break;
        }
    });

    // Finalize the description
    if (!description) {
        description = "Performs operations and returns a result.";
    } else {
        description = `This function ${description.toLowerCase()}`;
        if (paramNames.length > 0) {
            description += ` It uses the parameters: ${paramNames.join(", ")}.`;
        }
    }
    return description;
};


const traversePromiseChain = (node) => {
    let current = node;
    const chain = [];

    // Traverse the chain of call expressions
    while (current) {
        const callee = current.callee || current;

        // Check if the callee is a MemberExpression (e.g., axios.request().then())
        if (callee.type === "MemberExpression") {
            // Push the method name (e.g., "then", "catch")
            chain.push(callee.property.name);

            // Traverse to the previous part of the chain
            current = callee.object;
        }
        // If the callee is an Identifier (e.g., axios)
        else if (callee.type === "Identifier") {
            chain.push(callee.name); // Push the function name (e.g., "axios")
            break; // Break after processing the function call
        }
        // If the callee is another CallExpression, continue traversing
        else if (callee.type === "CallExpression") {
            current = callee; // Move to the next CallExpression
            continue; // Continue to the next iteration
        } else {
            break; // Break if we encounter an unexpected type
        }
    }

    // Reverse the chain to get the proper order
    return chain.reverse();
};

module.exports = { autoComment };  // Export the function
