import * as esprima from 'esprima';
let list;
const parseCode = (codeToParse) => {
    list = [];
    return esprima.parseScript(codeToParse,{loc: true});
    //The "loc: true" attribute saved me a other few people i told them about it :)

};

const recBody = parsed => {
    for(let i = 0;i<parsed.body.length;i++)
    {
        recParse(parsed.body[i]);
    }
    return '';
};

const recIf = parsed => {
    addToTable(parsed.loc.start.line,'If Statement',recParse(parsed.test),'');
    recParse(parsed.consequent);

    if(parsed.alternate != null)
        recParse(parsed.alternate);
};

const recFor = forParsed => {
    addToTable(forParsed.loc.start.line, 'For Statement',recParse(forParsed.test),recParse(forParsed.update));
    recParse(forParsed.body);
};

const recFuncDec = funcParsed => {
    let line = funcParsed.loc.start.line;
    addToTable(line, 'Function Declaration',funcParsed.id.name,'');
    for (let i = 0; i < funcParsed.params.length; i++) {
        addToTable(line,'Param',recParse(funcParsed.params[i]),'');
    }
    recParse(funcParsed.body);
};

const vDeclirator = vParsed => {
    // if(vParsed.init.property == null)
    // {
    //     addToTable(vParsed.loc.start.line,'Variable Declarator',vParsed.id.name,vParsed.init.value);
    // }
    // else
    addToTable(vParsed.loc.start.line,'Variable Declarator',vParsed.id.name
        ,recParse(vParsed.init));

    //print(test);
    //addToTable(vParsed.loc.start.line,'Variable Declarator',vParsed.id.name,recParse(vParsed.));
};

const vDecliration = vParsed => {
    for (let i = 0; i < vParsed.declarations.length; i++) {
        //the declarators
        recParse(vParsed.declarations[i]);
    }

};

const recAssign = assParsed => {
    let left = recParse(assParsed.left);
    let right = recParse(assParsed.right);
    addToTable(assParsed.loc.start.line, 'Assignment Expression',left,right);
    return left +'='+right;

};

const recUnary = uParsed => {
    let op = recParse(uParsed.left);
    op += recParse(uParsed.argument);
    return op;
};

const recBin = bParsed => {
    let bin = recParse(bParsed.left);
    bin+= bParsed.operator;
    bin += recParse(bParsed.right);
    return bin;
};

const recMemb = memParsed => {
    //console.log(memParsed.object);
    //console.log(memParsed.property);
    let s = recParse(memParsed.object) + '[' + recParse(memParsed.property) + ']';
    return s;
};

const retIdent = parsed => {return parsed.name;};

const retLit = parsed => {return parsed.value;};

function recWhile(parsed) {
    addToTable(parsed.loc.start.line,'While Statement','',recParse(parsed.test));
    recParse(parsed.body);
    return [parsed.loc.start.line,'While Statement','',recParse(parsed.test)];
}

function recReturn(parsed) {
    addToTable(parsed.loc.start.line,'Return Statement','',recParse(parsed.argument));
    if(parsed.argument == null)
        return [parsed.loc.start.line,'Return Statement','',''];
    return [parsed.loc.start.line,'Return Statement','',recParse(parsed.argument)]; //for testing
}

/* eslint-disable max-lines-per-function*/
const recParse=(parsed) =>{
    if(parsed == null)
        return '';
    else{
        switch (parsed.type) {
        case 'Program':
        {
            recBody(parsed);
            return list;//the end
        }
        case 'BlockStatement':
            recBody(parsed);
            break;
        case 'IfStatement':
            recIf(parsed);
            break;
        case 'ForStatement':
            recFor(parsed);
            break;
        case 'WhileStatement':
            recWhile(parsed);
            break;
        case 'FunctionDeclaration':
            recFuncDec(parsed);
            break;
        case 'VariableDeclarator':
            vDeclirator(parsed);
            break;
        case 'VariableDeclaration':
            vDecliration(parsed);
            break;
        case 'AssignmentExpression':
            return recAssign(parsed);
        case 'UnaryExpression':
            return recUnary(parsed);
        case 'BinaryExpression':
            return recBin(parsed);
        case 'MemberExpression':
            return recMemb(parsed);
        case 'Literal':
            return retLit(parsed);
        case 'Identifier':
            return retIdent(parsed);
        case 'ReturnStatement':
            return recReturn(parsed);
        default:
            return 'error';
        }
    }
};

const addToTable = (line, type, name, value) => {
    list.push([line,type,name,value]);
};
export {parseCode, recParse,recFor,retLit,retIdent,recBody,recReturn,recWhile,recMemb};
