$(function() {
    if(uniJsVars.notify) {
        var notify = function() {
            $('.add_to_cart.disabled').each(function() {
                var p_id = Number($(this).attr('class').replace(/\D+/g,'')),
                    params = '[{"reason":"'+uniJsVars.notify_text+'", "p_id":'+p_id+'}, "phone", "mail", "comment"]';

                $(this).unbind('click').attr('onclick', 'uniRequestOpen('+params+')').removeAttr('disabled').css('cursor', 'pointer');


            });
        };

        notify();

        $(document).ajaxStop(function() {
            setTimeout(function() {
                notify();
            }, 300);
        });
    }
});

function uniRequestOpen(params) {
    //params format - [{'reason':'text', 'p_id':number}, 'phone', 'mail', 'comment']
    //'phone', 'mail', 'comment' - names of the fields to display

    uniAddCss('catalog/view/theme/unishop2/stylesheet/request.css');
    uniAddJs('catalog/view/theme/unishop2/js/jquery.maskedinput.min.js');

    data = '';

    for (i in params) {
        if(typeof(params[i]) == 'object') {
            for (k in params[i]) {
                data += '&'+k+'='+encodeURIComponent(params[i][k]);
            }

        } else {
            data += '&'+params[i]+'=';
        }

    }

    //console.log(data)

    $.ajax({
        url:'index.php?route=extension/module/uni_request'+data,
        type:'get',
        dataType:'html',
        success: function(data) {
            $('html body').append(data);
            $('#modal-request-form').addClass(uniJsVars.popup_effect_in).modal('show');
        }
    });
}

function uniRequestSend() {
    var form = '#modal-request-form';

    $.ajax({
        url: 'index.php?route=extension/module/uni_request/mail',
        type: 'post',
        data: $(form+' input, '+form+' textarea').serialize()+'&location='+encodeURIComponent(window.location.href),
        dataType: 'json',
        beforeSend: function() {
            $('.callback_button').button('loading');
        },
        complete: function() {
            $('.callback_button').button('reset');
        },
        success: function(json) {
            $(form+' .text-danger').remove();

            if (json['error']) {
                for (i in json['error']) {
                    form_error(form, i);
                }

                uniFlyAlert('danger', json['error']);
            }

            if (json['success']) {
                if(uniJsVars.callback_metric_id && uniJsVars.callback_metric_target) {
                    new Function('yaCounter'+uniJsVars.callback_metric_id+'.reachGoal(\''+uniJsVars.callback_metric_target+'\')')();

                    //ym(uniJsVars.callback_metric_id, 'reachGoal', uniJsVars.callback_metric_target);
                }

                if(uniJsVars.callback_analityc_category && uniJsVars.callback_analityc_action) {
                    ga('send', 'event', uniJsVars.callback_analityc_category, uniJsVars.callback_analityc_action);
                }

                $('.modal-request').html($('<div class="callback_success">'+json['success']+'</div>').fadeIn());
            }
        }
    });
}