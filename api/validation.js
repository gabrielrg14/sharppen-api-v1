module.exports = app => {
    function existsOrError(value, msg) {
        if(!value) throw msg
        if(Array.isArray(value) && value.length === 0) throw msg
        if(typeof value === 'string' && !value.trim()) throw msg
    }
    
    function notExistsOrError(value, msg) {
        try {
            existsOrError(value, msg)
        } catch(msg) {
            return
        }
        throw msg
    }
    
    function equalsOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }

    function formatDate(data) {
        var dia = data.getDate();

        if (dia < 10) {
            dia = "0" + dia;
        }

        var mes = data.getMonth() + 1;
        if (mes < 10) {
            mes = "0" + mes;
        }
        
        if(mes == 01) {
            mes = "Janeiro"
        } else if(mes == 02) {
            mes = "Fevereiro"
        } else if(mes == 03) {
            mes = "Março"
        } else if(mes == 04) {
            mes = "Abril"
        } else if(mes == 05) {
            mes = "Maio"
        } else if(mes == 06) {
            mes = "Junho"
        } else if(mes == 07) {
            mes = "Julho"
        } else if(mes == 08) {
            mes = "Agosto"
        } else if(mes == 09) {
            mes = "Setembro"
        } else if(mes == 10) {
            mes = "Outubro"
        } else if(mes == 11) {
            mes = "Novembro"
        } else if(mes == 12) {
            mes = "Dezembro"
        }

        var ano = data.getFullYear();

        return `${dia} de ${mes} de ${ano}`
    }

    return { existsOrError, notExistsOrError, equalsOrError, formatDate }
}