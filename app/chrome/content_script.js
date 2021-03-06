// I stole this from github.com/panicsteve/cloud-to-butt {{=it.from }}

walk(document.body);

function walk(node) 
{
	// I stole this function from here:
	// http://is.gd/mwZp7E
	
	var child, next;
	
        try {
	    if (node.tagName.toLowerCase() == 'input' || node.tagName.toLowerCase() == 'textarea'
	        || node.classList.contains('ace_editor')) {
		    return;
	    }
        } catch (exep) {
            // >.<
        }

	switch ( node.nodeType )  
	{
		case 1:  // Element
		case 9:  // Document
		case 11: // Document fragment
			child = node.firstChild;
			while ( child ) 
			{
				next = child.nextSibling;
				walk(child);
				child = next;
			}
			break;

		case 3: // Text node
			handleText(node);
			break;
	}
}

function handleText(textNode) 
{
	var v = textNode.nodeValue;

	v = v.replace(/\b{{=it.from }}\b/g, "{{=it.to }}");
	
	textNode.nodeValue = v;
}
