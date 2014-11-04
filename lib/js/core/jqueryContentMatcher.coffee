jQuerySG.expr[":"].content = (el, i, m) ->
    search = m[3]
    return false unless search
    jQuerySG.trim(jQuerySG(el).text().replace(/\s+/g, ' ')) == search
