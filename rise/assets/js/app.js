$(document).ready(function () {
    $.ajaxSetup({cache: false});

    //set locale of moment js
    moment.locale(AppLanugage.locale);

    //set locale for datepicker
    (function ($) {
        $.fn.datepicker.dates['custom'] = {
            days: AppLanugage.days,
            daysShort: AppLanugage.daysShort,
            daysMin: AppLanugage.daysMin,
            months: AppLanugage.months,
            monthsShort: AppLanugage.monthsShort,
            today: AppLanugage.today
        };
    }(jQuery));

    //set datepicker language

    $('body').on('click', '[data-act=ajax-modal]', function () {
        var data = {ajaxModal: 1},
                url = $(this).attr('data-action-url'),
                isLargeModal = $(this).attr('data-modal-lg'),
                isFullscreenModal = $(this).attr('data-modal-fullscreen'),
                isCustomBgModal = $(this).attr('data-modal-custom-bg'),
                isCloseModal = $(this).attr('data-modal-close'),
                title = $(this).attr('data-title');
        if (!url) {
            console.log('Ajax Modal: Set data-action-url!');
            return false;
        }
        if (title) {
            $("#ajaxModalTitle").html(title);
        } else {
            $("#ajaxModalTitle").html($("#ajaxModalTitle").attr('data-title'));
        }

        if ($(this).attr("data-post-hide-header")) {
            $("#ajaxModal .modal-header").addClass("hide");
            $("#ajaxModal .modal-footer").addClass("hide");
        } else {
            $("#ajaxModal .modal-header").removeClass("hide");
            $("#ajaxModal .modal-footer").removeClass("hide");
        }

        $("#ajaxModalContent").html($("#ajaxModalOriginalContent").html());
        $("#ajaxModalContent").find(".original-modal-body").removeClass("original-modal-body").addClass("modal-body");
        $("#ajaxModal").modal('show');
        $("#ajaxModal").find(".modal-dialog").removeClass("custom-modal-lg");
        $("#ajaxModal").find(".modal-dialog").removeClass("modal-fullscreen");
        $("#ajaxModal").find(".modal-dialog").removeClass("custom-bg-modal");
        $("#ajaxModal").removeClass("global-search-modal");

        $(this).each(function () {
            $.each(this.attributes, function () {
                if (this.specified && this.name.match("^data-post-")) {
                    var dataName = this.name.replace("data-post-", "");
                    data[dataName] = this.value;
                }
            });
        });
        ajaxModalXhr = $.ajax({
            url: url,
            data: data,
            cache: false,
            type: 'POST',
            success: function (response) {
                $("#ajaxModal").find(".modal-dialog").removeClass("mini-modal");
                if (isLargeModal === "1") {
                    $("#ajaxModal").find(".modal-dialog").addClass("custom-modal-lg");
                } else if (isFullscreenModal === "1") {
                    $("#ajaxModal").find(".modal-dialog").addClass("modal-fullscreen");
                }

                if (isCloseModal === "1") {
                    $("#ajaxModal").addClass("global-search-modal");
                }

                if (isCustomBgModal === "1") {
                    $("#ajaxModal").find(".modal-dialog").addClass("custom-bg-modal");
                }

                $("#ajaxModalContent").html(response);

                setSummernoteToAll(true);
                setModalScrollbar();

                feather.replace();
            },
            statusCode: {
                403: function () {
                    console.log("403: Session expired.");
                    location.reload();
                },
                404: function () {
                    $("#ajaxModalContent").find('.modal-body').html("");
                    appAlert.error("404: Page not found.", {container: '.modal-body', animate: false});
                }
            },
            error: function () {
                $("#ajaxModalContent").find('.modal-body').html("");
                appAlert.error("500: Internal Server Error.", {container: '.modal-body', animate: false});
            }
        });
        return false;
    });

    //abort ajax request on modal close.
    $('#ajaxModal').on('hidden.bs.modal', function (e) {
        ajaxModalXhr.abort();
        $("#ajaxModal").find(".modal-dialog").removeClass("modal-lg");
        $("#ajaxModal").find(".modal-dialog").addClass("modal-lg");

        $("#ajaxModalContent").html("");
    });

    //common ajax request
    $('body').on('click show.bs.dropdown', '[data-act=ajax-request]', function () {
        var data = {},
                $selector = $(this),
                url = $selector.attr('data-action-url'),
                removeOnSuccess = $selector.attr('data-remove-on-success'),
                removeOnClick = $selector.attr('data-remove-on-click'),
                fadeOutOnSuccess = $selector.attr('data-fade-out-on-success'),
                fadeOutOnClick = $selector.attr('data-fade-out-on-click'),
                inlineLoader = $selector.attr('data-inline-loader'),
                reloadOnSuccess = $selector.attr('data-reload-on-success'),
                showResponse = $selector.attr('data-show-response');

        var $target = "";
        if ($selector.attr('data-real-target')) {
            $target = $($selector.attr('data-real-target'));
        } else if ($selector.attr('data-closest-target')) {
            $target = $selector.closest($selector.attr('data-closest-target'));
        }

        if (!url) {
            console.log('Ajax Request: Set data-action-url!');
            return false;
        }

        //remove the target element
        if (removeOnClick && $(removeOnClick).length) {
            $(removeOnClick).remove();
        }

        //remove the target element with fade out effect
        if (fadeOutOnClick && $(fadeOutOnClick).length) {
            $(fadeOutOnClick).fadeOut(function () {
                $(this).remove();
            });
        }

        $selector.each(function () {
            $.each(this.attributes, function () {
                if (this.specified && this.name.match("^data-post-")) {
                    var dataName = this.name.replace("data-post-", "");
                    data[dataName] = this.value;
                }
            });
        });
        if (inlineLoader === "1") {
            $selector.addClass("spinning");
        } else {
            appLoader.show();
        }

        var ajaxOptions = {
            url: url,
            data: data,
            cache: false,
            type: 'POST',
            success: function (response) {
                if (inlineLoader === "1") {
                    $selector.removeClass("spinning");
                }


                if (showResponse && response) {
                    if (response.success) {
                        if (response.message) {
                            appAlert.success(response.message, {duration: 10000});
                        }

                        if (reloadOnSuccess) {
                            location.reload();
                        }
                    } else {
                        appAlert.error(response.message);
                    }
                } else if (reloadOnSuccess) {
                    location.reload();
                }

                //remove the target element
                if (removeOnSuccess && $(removeOnSuccess).length) {
                    $(removeOnSuccess).remove();
                }

                //remove the target element with fade out effect
                if (fadeOutOnSuccess && $(fadeOutOnSuccess).length) {
                    $(fadeOutOnSuccess).fadeOut(function () {
                        $(this).remove();
                    });
                }

                appLoader.hide();
                if ($target.length) {
                    if ($selector.attr("data-append")) {
                        $selector.remove();
                        $target.append(response);
                    } else {
                        $target.html(response);
                    }
                }
            },
            statusCode: {
                404: function () {
                    appLoader.hide();
                    appAlert.error("404: Page not found.");
                }
            },
            error: function () {
                appLoader.hide();
                appAlert.error("500: Internal Server Error.");
            }
        };

        if (showResponse) {
            ajaxOptions.dataType = 'json';
        }

        ajaxRequestXhr = $.ajax(ajaxOptions);

    });

    //bind ajax tab
    $('body').on('click', '[data-bs-toggle="ajax-tab"] a', function () {
        var $this = $(this),
                loadurl = $this.attr('href'),
                target = $this.attr('data-bs-target');
        if (!target)
            return false;

        if ($this.attr("data-reload")) {
            //remove data first if it's need to reload everytime
            $(target).html("");
        }

        if ($(target).html() === "" || $this.attr("data-reload")) {
            appLoader.show({container: target, css: "right:50%; bottom:auto;"});

            $.ajax({
                url: loadurl,
                cache: false,
                type: 'GET',
                success: function (response) {
                    $(target).html(response);
                    feather.replace();
                    selectLastlySelectedTab(target);
                },
                statusCode: {
                    403: function () {
                        console.log("403: Session expired.");
                        location.reload();
                    },
                    404: function () {
                        appLoader.hide();
                        appAlert.error("404: Page not found.");
                    }
                },
                error: function () {
                    appLoader.hide();
                    appAlert.error("500: Internal Server Error.");
                }
            });

//            $.get(loadurl, function (data, test, test2) {
//                $(target).html(data);
//                feather.replace();
//                selectLastlySelectedTab(target);
//            });
        }
        $this.tab('show');
        return false;
    });

    selectLastlySelectedTab();

    $('body').on('click', '[data-toggle="app-modal"]', function () {
        var sidebar = true;

        if ($(this).attr("data-sidebar") === "0") {
            sidebar = false;
        }

        appContentModal.init({url: $(this).attr("data-url"), sidebar: sidebar});
        return false;
    });




    //prepare common delete confimation
    var recordDeleteHandler = function (result, $target) {
        var callbackFunction = $target.attr("data-success-callback");

        if (callbackFunction && typeof window[callbackFunction] != 'undefined') {
            window[callbackFunction](result, $target);

            if (result.message) {
                appAlert.warning(result.message, {duration: 20000});
            }

        }
    };

    var linkDeleteConfirmationHandler = function (e) {
        deleteConfirmationHandler(e, recordDeleteHandler);
    };


    //bind the delete confimation modal which links are not in tables. because there is an another logic for datatable.
    $('body').on('click', 'a[data-action=delete-confirmation]:not(table a)', linkDeleteConfirmationHandler);

    var addCommentLink = function (event) {
        //modify comment link copied text on pasting
        var clipboardData = event.originalEvent.clipboardData.getData('text/plain');
        if (clipboardData.indexOf('/#comment') > -1) {
            //pasted comment link
            event.preventDefault();

            var splitClipboardData = clipboardData.split("/"),
                    splitClipboardDataCount = splitClipboardData.length,
                    commentId = splitClipboardData[splitClipboardDataCount - 1];

            if (!commentId) {
                //there has an extra / at last
                splitClipboardDataCount = splitClipboardDataCount - 1;
                commentId = splitClipboardData[splitClipboardDataCount - 1];
            }

            var splitCommentId = commentId.split("-");
            commentId = splitCommentId[1];

            var taskId = splitClipboardData[splitClipboardDataCount - 2];

            var newClipboardData = "#[" + taskId + "-" + commentId + "] (" + AppLanugage.comment + ") ";

            document.execCommand('insertText', false, newClipboardData);
        }
    };

    //normal input/textarea
    $('body').on('paste', 'input, textarea', function (e) {
        addCommentLink(e);
    });

    //summernote
    $('body').on('summernote.paste', function (e, ne) {
        addCommentLink(ne);
    });
});


function delayAction(callback, ms) {
    var timer = 0;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}



//select the lastly selected ajax-tab automatically if it exists user-wise
function selectLastlySelectedTab(target) {
    if (!target) {
        target = "";
    }

    $(target + " [data-bs-toggle='ajax-tab']").each(function () {
        var tabList = $(this).attr("id"),
                lastTab = getCookie("user_" + AppHelper.userId + "_" + tabList),
                $specificTab = $(this).find("[data-bs-target='" + lastTab + "']");

        if (lastTab && $specificTab.attr("data-bs-target")) {
            setTimeout(function () {
                $specificTab.trigger("click");
            }, 50);
        } else {
            //load first tab
            $(this).find("a").first().trigger("click");
        }
    });
}

//custom app form controller
(function ($) {
    $.fn.appForm = function (options) {

        var defaults = {
            ajaxSubmit: true,
            isModal: true,
            closeModalOnSuccess: true,
            dataType: "json",
            showLoader: true,
            onModalClose: function () {
            },
            onSuccess: function () {
            },
            onError: function () {
                return true;
            },
            onSubmit: function () {
            },
            onAjaxSuccess: function () {
            },
            beforeAjaxSubmit: function (data, self, options) {
            }
        };
        var settings = $.extend({}, defaults, options);
        this.each(function () {
            if (settings.ajaxSubmit) {
                validateForm($(this), function (form) {
                    settings.onSubmit();


                    if (settings.isModal) {
                        maskModal($("#ajaxModalContent").find(".modal-body"));
                    } else {
                        $(form).find('[type="submit"]').attr('disabled', 'disabled');
                    }

                    //set empty value to all textarea, if they are empty
                    if (AppHelper.settings.enableRichTextEditor === "1") {
                        $("textarea").each(function () {
                            var $instance = $(this);
                            if ($instance.attr("data-rich-text-editor")) {
                                if ($instance.val() === '<p><br></p>' || $instance.val() === "") {
                                    $instance.val('');
                                } else {
                                    $instance.val($instance.summernote('code'));
                                }
                            }
                        });
                    }

                    $(form).ajaxSubmit({
                        dataType: settings.dataType,
                        beforeSubmit: function (data, self, options) {

                            //Modified \assets\js\jquery-validation\jquery.form.js #1178.
                            //Added data  a.push({name: n, value: v, type: el.type, required: el.required, data: $(el).data()});

                            //to set the convertDateFormat with the input fields, we used the setDatePicker function.
                            //it is the easiest way to regognize the date fields.

                            $.each(data, function (index, obj) {
                                if (obj.data && obj.data.convertDateFormat && obj.value) {
                                    data[index]["value"] = convertDateToYMD(obj.value);
                                }
                            });

                            if (!settings.isModal && settings.showLoader) {
                                appLoader.show({container: form, css: "top:2%; right:46%;"});
                            }


                            settings.beforeAjaxSubmit(data, self, options);
                        },
                        success: function (result) {
                            settings.onAjaxSuccess(result);

                            if (result.success) {
                                settings.onSuccess(result);
                                if (settings.isModal && settings.closeModalOnSuccess) {
                                    closeAjaxModal(true);
                                }

                                //remove summernote from all existing summernote field
                                if (!settings.isModal) {
                                    $(form).find("textarea").each(function () {
                                        if ($(this).attr("data-rich-text-editor") != undefined && $(this).attr("data-keep-rich-text-editor-after-submit") == undefined) {
                                            $(this).summernote('destroy');
                                        }
                                    });
                                }

                                appLoader.hide();
                            } else {
                                if (settings.onError(result)) {
                                    if (settings.isModal) {
                                        unmaskModal();
                                        if (result.message) {
                                            appAlert.error(result.message, {container: '.modal-body', animate: false});
                                        }
                                    } else if (result.message) {
                                        appAlert.error(result.message);
                                    }
                                }
                            }

                            $(form).find('[type="submit"]').removeAttr('disabled');
                        }
                    });
                });
            } else {
                validateForm($(this));
            }
        });
        /*
         * @form : the form we want to validate;
         * @customSubmit : execute custom js function insted of form submission. 
         * don't pass the 2nd parameter for regular form submission
         */

        function convertDateToYMD(date) {
            if (date) {
                var dateFormat = AppHelper.settings.dateFormat || "Y.m.d",
                        dateFormat = dateFormat.toLowerCase(),
                        separator = dateFormat.charAt("1"),
                        dateFormatArray = dateFormat.split(separator),
                        yearIndex = 0,
                        monthIndex = 1,
                        dayIndex = 2;

                if (dateFormatArray[1] === "y") {
                    yearIndex = 1;
                } else if (dateFormatArray[2] === "y") {
                    yearIndex = 2;
                }

                if (dateFormatArray[0] === "m") {
                    monthIndex = 0;
                } else if (dateFormatArray[2] === "m") {
                    monthIndex = 2;
                }

                if (dateFormatArray[0] === "d") {
                    dayIndex = 0;
                } else if (dateFormatArray[1] === "d") {
                    dayIndex = 1;
                }

                var dateValue = date.split(separator);

                return dateValue[yearIndex] + "-" + dateValue[monthIndex] + "-" + dateValue[dayIndex];
            }

        }

        function validateForm(form, customSubmit) {
            //add custom method
            $.validator.addMethod("greaterThanOrEqual",
                    function (value, element, params) {
                        var paramsVal = params;
                        if (params && (params.indexOf("#") === 0 || params.indexOf(".") === 0)) {
                            paramsVal = $(params).val();
                        }

                        if (typeof $(element).attr("data-rule-required") === 'undefined' && !value) {
                            return true;
                        }

                        if (!/Invalid|NaN/.test(new Date(convertDateToYMD(value)))) {
                            return !paramsVal || (new Date(convertDateToYMD(value)) >= new Date(convertDateToYMD(paramsVal)));
                        }
                        return isNaN(value) && isNaN(paramsVal)
                                || (Number(value) >= Number(paramsVal));
                    }, 'Must be greater than {0}.');

            //add custom method
            $.validator.addMethod("greaterThan",
                    function (value, element, params) {
                        var paramsVal = params;
                        if (params && (params.indexOf("#") === 0 || params.indexOf(".") === 0)) {
                            paramsVal = $(params).val();
                        }
                        if (!/Invalid|NaN/.test(new Number(value))) {
                            return new Number((value)) > new Number((paramsVal));
                        }
                        return isNaN(value) && isNaN(paramsVal)
                                || (Number(value) > Number(paramsVal));
                    }, 'Must be greater than.');

            //add custom method
            $.validator.addMethod("mustBeSameYear",
                    function (value, element, params) {
                        var paramsVal = params;
                        if (params && (params.indexOf("#") === 0 || params.indexOf(".") === 0)) {
                            paramsVal = $(params).val();
                        }
                        if (!/Invalid|NaN/.test(new Date(convertDateToYMD(value)))) {
                            var dateA = new Date(convertDateToYMD(value)), dateB = new Date(convertDateToYMD(paramsVal));
                            return (dateA && dateB && dateA.getFullYear() === dateB.getFullYear());
                        }
                    }, 'The year must be same for both dates.');

            $(form).validate({
                submitHandler: function (form) {
                    if (customSubmit) {
                        customSubmit(form);
                    } else {
                        return true;
                    }
                },
                highlight: function (element) {
                    $(element).closest('.form-group').addClass('has-error');
                },
                unhighlight: function (element) {
                    $(element).closest('.form-group').removeClass('has-error');
                },
                errorElement: 'span',
                errorClass: 'help-block',
                ignore: ":hidden:not(.validate-hidden)",
                errorPlacement: function (error, element) {
                    if (element.parent('.input-group').length) {
                        error.insertAfter(element.parent());
                    } else {
                        error.insertAfter(element);
                    }
                }
            });
            //handeling the hidden field validation like select2
            $(".validate-hidden").click(function () {
                $(this).closest('.form-group').removeClass('has-error').find(".help-block").hide();
            });
        }

        //show loadig mask on modal before form submission;
        function maskModal($maskTarget) {
            var padding = $maskTarget.height() - 80;
            if (padding > 0) {
                padding = Math.floor(padding / 2);
            }
            $maskTarget.after("<div class='modal-mask'><div class='circle-loader'></div></div>");
            //check scrollbar
            var height = $maskTarget.outerHeight();
            $('.modal-mask').css({"width": $maskTarget.width() + 22 + "px", "height": height + "px", "padding-top": padding + "px"});
            $maskTarget.closest('.modal-dialog').find('[type="submit"]').attr('disabled', 'disabled');
            $maskTarget.addClass("hide");
        }

        //remove loadig mask from modal
        function unmaskModal() {
            var $maskTarget = $(".modal-body").removeClass("hide");
            $maskTarget.closest('.modal-dialog').find('[type="submit"]').removeAttr('disabled');
            $maskTarget.removeClass("hide");
            $(".modal-mask").remove();
        }

        //colse ajax modal and show success check mark
        function closeAjaxModal(success) {
            if (success) {
                $(".modal-mask").html("<div class='circle-done'><i data-feather='check' stroke-width='5'></i></div>");
                setTimeout(function () {
                    $(".modal-mask").find('.circle-done').addClass('ok');
                }, 30);
            }
            setTimeout(function () {
                $(".modal-mask").remove();
                $("#ajaxModal").modal('toggle');
                settings.onModalClose();
            }, 1000);
        }


        this.closeModal = function () {
            closeAjaxModal(true);
        };

        return this;
    };
})(jQuery);

var getWeekRange = function (date) {
    //set first and last day of week
    if (!date)
        date = moment().format("YYYY-MM-DD");

    var dayOfWeek = moment(date).format("E"),
            diff = dayOfWeek - AppHelper.settings.firstDayOfWeek,
            range = {};

    if (diff < 7) {
        range.firstDateOfWeek = moment(date).subtract(diff, 'days').format("YYYY-MM-DD");
    } else {
        range.firstDateOfWeek = moment(date).format("YYYY-MM-DD");
    }

    if (diff < 0) {
        range.firstDateOfWeek = moment(range.firstDateOfWeek).subtract(7, 'days').format("YYYY-MM-DD");
    }

    range.lastDateOfWeek = moment(range.firstDateOfWeek).add(6, 'days').format("YYYY-MM-DD");
    return range;
};

//find saved filter
function getFilterInfo(filterId) {
    var filterInfo = null;
    $.each(AppHelper.settings.filters || [], function (index, filter) {
        if (filterId === filter.id) {
            filterInfo = filter;
        }
    });
    return filterInfo;
}

//always check the getContextFilterInfo to apply filter 
function getContextFilterInfo(filterId, settings) {
    var filterInfo = getFilterInfo(filterId),
            context = settings.smartFilterIdentity,
            context_id = settings.contextMeta ? settings.contextMeta.contextId : "";
    if ((filterInfo && context) && (filterInfo.context !== context && filterInfo.context !== context + "_" + context_id)) {
        filterInfo = null; // context doesn't matched 
    }
    return filterInfo;
}


function  getContextFilters(settings) {
    var filters = [],
            context = settings.smartFilterIdentity,
            context_id = settings.contextMeta ? settings.contextMeta.contextId : "";

    var context_with_id = "";
    if (context_id) {
        context_with_id = context + "_" + context_id;
    }

    if (context) {
        $.each(AppHelper.settings.filters || [], function (index, filter) {
            if (filter.context === context || filter.context === context_with_id) {
                filters.push(filter);
            }
        });
    }

    filters.sort(function (a, b) {
        var fa = a.title.toLowerCase(),
                fb = b.title.toLowerCase();

        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });

    return filters;
}


class DefaultFilters {
    constructor(settings) {
        this.settings = settings;
        this.init();
        return this.settings;
    }
    init() {
        var filterId = getFilterIdFromCookie(this.settings);
        if (filterId && this.settings.stateSave && !this.settings.ignoreSavedFilter && getContextFilterInfo(filterId, this.settings)) {
            this.initSelectedFilter(filterId);
        } else {
            this.prepareDefaultDateRangeFilterParams();
            this.prepareDefaultCheckBoxFilterParams();
            this.prepareDefaultMultiSelectilterParams();
            this.prepareDefaultRadioFilterParams();
            this.prepareDefaultDropdownFilterParams();
            this.prepareDefaultrSingleDatepickerFilterParams();
            this.prepareDefaultrRngeDatepickerFilterParams();
        }
    }
    initSelectedFilter(filterId) {
        if (filterId) {
            var filterParams = {};
            var filterInfo = getContextFilterInfo(filterId, this.settings);
            if (filterInfo) {
                filterParams = cloneDeep(filterInfo.params);
            }
            this.settings.filterParams = cloneDeep(filterParams);
        }
    }
    prepareDefaultDateRangeFilterParams() {
        var settings = this.settings;
        if (settings.dateRangeType === "daily") {
            settings.filterParams.start_date = moment().format(settings._inputDateFormat);
            settings.filterParams.end_date = settings.filterParams.start_date;
        } else if (settings.dateRangeType === "monthly") {
            var daysInMonth = moment().daysInMonth(),
                    yearMonth = moment().format("YYYY-MM");
            settings.filterParams.start_date = yearMonth + "-01";
            settings.filterParams.end_date = yearMonth + "-" + daysInMonth;
        } else if (settings.dateRangeType === "yearly") {
            var year = moment().format("YYYY");
            settings.filterParams.start_date = year + "-01-01";
            settings.filterParams.end_date = year + "-12-31";
        } else if (settings.dateRangeType === "weekly") {
            var range = getWeekRange();
            settings.filterParams.start_date = range.firstDateOfWeek;
            settings.filterParams.end_date = range.lastDateOfWeek;
        }
        this.settings = settings;
    }
    prepareDefaultCheckBoxFilterParams(settings) {
        var settings = this.settings;
        var values = [],
                name = "";
        $.each(settings.checkBoxes, function (index, option) {
            name = option.name;
            if (option.isChecked) {
                values.push(option.value);
            }
        });
        settings.filterParams[name] = values;
        this.settings = settings;
    }
    prepareDefaultMultiSelectilterParams(settings) {
        var settings = this.settings;
        $.each(settings.multiSelect, function (index, option) {
            var saveSelection = option.saveSelection,
                    selections = getCookie(option.name);

            var values = [];

            if (saveSelection && selections) {
                selections = selections.split("-");
                values = selections;
            } else {
                $.each(option.options, function (index, listOption) {
                    if (listOption.isChecked) {
                        values.push(listOption.value);
                    }
                });
            }

            settings.filterParams[option.name] = values;
        });

        this.settings = settings;
    }
    prepareDefaultRadioFilterParams(settings) {
        var settings = this.settings;
        $.each(settings.radioButtons, function (index, option) {
            if (option.isChecked) {
                settings.filterParams[option.name] = option.value;
            }
        });
        this.settings = settings;
    }
    prepareDefaultDropdownFilterParams(settings) {
        var settings = this.settings;
        $.each(settings.filterDropdown || [], function (index, dropdown) {
            $.each(dropdown.options, function (index, option) {
                if (option.isSelected) {
                    settings.filterParams[dropdown.name] = option.id;
                }
            });
        });
        this.settings = settings;
    }
    prepareDefaultrSingleDatepickerFilterParams(settings) {
        var settings = this.settings;
        $.each(settings.singleDatepicker || [], function (index, datepicker) {
            $.each(datepicker.options || [], function (index, option) {
                if (option.isSelected) {
                    settings.filterParams[datepicker.name] = option.value;
                }
            });
        });
        this.settings = settings;
    }
    prepareDefaultrRngeDatepickerFilterParams(settings) {
        var settings = this.settings;
        $.each(settings.rangeDatepicker || [], function (index, datepicker) {

            if (datepicker.startDate && datepicker.startDate.value) {
                settings.filterParams[datepicker.startDate.name] = datepicker.startDate.value;
            }

            if (datepicker.startDate && datepicker.endDate.value) {
                settings.filterParams[datepicker.endDate.name] = datepicker.endDate.value;
            }

        });
        this.settings = settings;
    }

}

var prepareDefaultFilters = function (settings) {
    var filters = new DefaultFilters(settings);
    return filters;
};

function cloneDeep(value) {
    if (typeof value !== 'object' || value === null) {
        return value;
    }

    let clone;

    if (Array.isArray(value)) {
        clone = [];
        for (let i = 0; i < value.length; i++) {
            clone[i] = cloneDeep(value[i]);
        }
    } else {
        clone = {};
        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                clone[key] = cloneDeep(value[key]);
            }
        }
    }

    return clone;
}

function getFilterIdFromCookie(settings) {
    var userId = AppHelper.userId ? AppHelper.userId : "public";
    return getCookie("filter_" + settings.smartFilterIdentity + "_" + userId);
}


class BuildFilters {
    constructor(settings, $instanceWrapper, $instance) {
        this.leftFilterSectionClsss = ".filter-section-left";
        this.rightFilterSectionClsss = ".filter-section-right";
        this.filterFormClass = ".filter-form";
        this.settings = settings;
        this.$instanceWrapper = $instanceWrapper;
        this.$instance = $instance;
        this.randomId = getRandomAlphabet(5);
        this.filterElements = []; // [paramName] = {setValue: function()}
        this.activeFilterId = "";
        this.state = "new_filter"; //new_filter/change_filter
    }
    init() {
        this.prepareSurchOption();
        this.prepareCollapsePannelButton();
        this.prepareReloadButton();
        this.prepareSmartFilterDropdown();
        this.prepareFilterFormShowButton();
        this.prepareBookmarkFilterButtons();
        this.hideFilterForm();
        this.prepareDropdownFilters();
        this.prepareDateRangePicker();
        this.prepareDatePickerFilter();
        this.prepareSingleDatePicker();
        this.prepareRadioFilter();
        this.prepareMultiselectFilter();
        this.prepareCheckboxFilter();
        this.prepareSaveFilterButton();
        this.prepareCancelFilterFormButton();
        this.initActiveFilterFromCookie();

        if (!window.Filters) {
            window.Filters = [];
        }

        window.Filters[this.settings.smartFilterIdentity] = this;
    }
    saveSelectedFilter() {
        var userId = AppHelper.userId ? AppHelper.userId : "public";
        setCookie("filter_" + this.settings.smartFilterIdentity + "_" + userId, this.activeFilterId);
    }
    initActiveFilterFromCookie() {
        if (this.settings.stateSave && !this.settings.ignoreSavedFilter) {
            var filterId = getFilterIdFromCookie(this.settings);

            if (filterId) {
                var filterInfo = getContextFilterInfo(filterId, this.settings);
                if (filterInfo) {
                    this.activeFilterId = filterId;
                    this.applySelectedFilter(filterId, false);
                }
            }
        }
    }
    reloadInstance() {
        if (this.$instance.is("table")) {
            this.$instance.appTable({reload: true, filterParams: this.settings.filterParams});
        } else {
            this.$instance.appFilters({reload: true, filterParams: this.settings.filterParams});
        }
    }
    prepareSmartFilterDropdown() {
        if (this.settings.smartFilterIdentity) {

            var it = this;


            var dataPostAttrs = " data-post-context='" + it.settings.smartFilterIdentity + "' "
                    + " data-post-instance_id='" + it.getInstanceId() + "' ";

            if (it.getContextId()) {
                dataPostAttrs += " data-post-context_id= '" + it.getContextId() + "' ";
            }


            var actionUrl = AppHelper.baseUrl + "index.php/filters/manage_modal/" + it.settings.smartFilterIdentity;

            var dropdown = "<div class='dropdown-menu w300'>"
                    + '<div class="pb10 pl10">'
                    + '<a class="inline-block btn btn-default manage-filters-button" data-act="ajax-modal" data-title="' + AppLanugage.manageFilters + '" ' + dataPostAttrs + '  type="button" data-action-url="' + actionUrl + '" ><i data-feather="tool" class="icon-16 mr5"></i>' + AppLanugage.manageFilters + ' </a>'
                    + '<a class="inline-block btn btn-default clear-filter-button ml10 hide" href="#"><i data-feather="delete" class="icon-16 mr5"></i>' + AppLanugage.clear + '</a></div>'
                    + '<input type="text" class="form-control search-filter" placeholder="' + AppLanugage.search + '">'
                    + '<div class="dropdown-divider"></div>'
                    + "<ul class='list-group smart-filter-list-group'></ul>"
                    + "</div>";

            var smartFilterDropdownDom = '<div class="filter-item-box">'
                    + '<div class="dropdown smart-filter-dropdown-container">'
                    + '<button class="btn btn-default smart-filter-dropdown dropdown-toggle caret" type="button" data-bs-toggle="dropdown" aria-expanded="true"></button>'
                    + dropdown
                    + '</div>'
                    + '</div>';

            this.$instanceWrapper.find(it.leftFilterSectionClsss).append(smartFilterDropdownDom);
            this.refreshFilterDropdown();

            this.$instanceWrapper.find(".smart-filter-dropdown-container").on('click', '.smart-filter-item', function () {
                var data = $(this).data() || {},
                        filterId = data.id;
                it.state = "new_filter";
                it.applySelectedFilter(filterId);
            });

            var $dropdownSearch = this.$instanceWrapper.find(".search-filter");
            var $dropdown = this.$instanceWrapper.find(".smart-filter-dropdown-container");

            var addScrollOnDropdown = function () {
                var $listGroup = it.$instanceWrapper.find('.smart-filter-list-group');
                var $target = it.$instanceWrapper.find(".smart-filter-item.active");
                if (it.$instanceWrapper.find(".smart-filter-item:visible").length > 6) {
                    $listGroup.css({"overflow-y": "scroll", "height": "270px"});
                    var targetTop = $target.offset() ? $target.offset().top : 0;
                    var listGroupTop = $listGroup.offset() ? $listGroup.offset().top : 0;

                    if ((targetTop - listGroupTop) > $listGroup.height()) {
                        $listGroup.scrollTop(targetTop - listGroupTop);
                    }
                } else {
                    $listGroup.css({"overflow-y": "scroll", "height": "auto"});
                }
            };

            $dropdown.on("show.bs.dropdown", function () {
                setTimeout(function () {
                    addScrollOnDropdown();
                    $dropdownSearch.val("").focus();
                    if (!it.$instanceWrapper.find(".smart-filter-item.active").length) {
                        it.$instanceWrapper.find(".smart-filter-item").first().addClass("active");
                    }
                });

            });


            $dropdownSearch.on("input", function (e) {
                var $dropdownItems = it.$instanceWrapper.find(".smart-filter-item");
                var searchTerm = $(this).val().toLowerCase();
                var hasActive = false;
                $dropdownItems.each(function () {
                    var itemText = $(this).html().toLowerCase(),
                            removeActive = true;
                    if (itemText.includes(searchTerm)) {
                        $(this).parent().removeClass("hide");
                        if (!hasActive) {
                            $(this).addClass("active");
                            hasActive = true;
                            removeActive = false;
                        }
                    } else {
                        $(this).parent().addClass("hide");
                    }
                    if (removeActive) {
                        $(this).removeClass("active");
                    }

                });
                addScrollOnDropdown();
            });

            $dropdownSearch.on("keydown", function (e) {
                var $activeDropdown = it.$instanceWrapper.find(".smart-filter-item.active");

                if (e.keyCode === 40) { // Arrow Down
                    e.preventDefault();
                    if ($activeDropdown.parent().nextAll(":visible").length) {
                        $activeDropdown.removeClass("active");
                        $activeDropdown = $activeDropdown.parent().nextAll(":visible").first().find("a").addClass("active");
                    }
                } else if (e.keyCode === 38) { // Arrow Up
                    e.preventDefault();
                    if ($activeDropdown.parent().prevAll(":visible").length) {
                        $activeDropdown.removeClass("active");
                        $activeDropdown = $activeDropdown.parent().prevAll(":visible").first().find("a").addClass("active");
                    }

                } else if (e.keyCode === 13) { // Enter
                    e.preventDefault();
                    it.$instanceWrapper.find(".smart-filter-item.active").trigger("click");
                    $dropdown.dropdown("toggle");
                }

                var $listGroup = it.$instanceWrapper.find('.smart-filter-list-group');

                if ($activeDropdown.length && ($activeDropdown.offset().top + $activeDropdown.outerHeight() - $listGroup.offset().top) > $listGroup.height()) {
                    $listGroup.scrollTop($listGroup.scrollTop() + $activeDropdown.outerHeight());
                } else if ($activeDropdown.length && ($activeDropdown.offset().top - $listGroup.offset().top) < 0) {
                    $listGroup.scrollTop($listGroup.scrollTop() - $activeDropdown.outerHeight());
                }

            });

            this.$instanceWrapper.find(".clear-filter-button").click(function () {
                it.activeFilterId = "";
                it.clearAllFilters();
                it.refreshFilterDropdown();
                it.reloadInstance();
                it.saveSelectedFilter();
            });
        }
    }
    initChangeFilter(filterId) {
        this.activeFilterId = filterId;
        this.showFilterForm();
        this.state = "change_filter";
        this.applySelectedFilter(filterId);
    }
    applySelectedFilter(filterId, reload = true) {
        var it = this;

        if (filterId) {
            it.activeFilterId = filterId;

            var filterParams = [];

            var filterInfo = getContextFilterInfo(filterId, this.settings);
            it.settings.filterParams = cloneDeep(filterInfo.params);
            filterParams = cloneDeep(filterInfo.params);

            //set filter values
            var hasFilter = [];

            $.each(filterParams, function (index, value) {
                hasFilter.push(index);
                var filterMap = it.filterElements[index];
                if (filterMap) {
                    filterMap.setValue(value, cloneDeep(filterParams));
                }
            });

            //reset other filters 

            for (var key in it.filterElements) {
                if (!hasFilter.includes(key)) {
                    var filterMap = it.filterElements[key];
                    if (filterMap) {
                        filterMap.setValue("");
                    }
                }
            }

            it.refreshFilterDropdown();
            if (reload !== false) {
                it.reloadInstance();
            }

            it.showHideClearFilterButton();
            it.updateFilterModalState(filterInfo);
            it.saveSelectedFilter();
    }

    }
    refreshFilterDropdown() {
        var options = "",
                it = this,
                filters = it.getFilters(),
                title = "";

        $.each(filters, function (index, filterItem) {

            var active = "";
            if (filterItem.id === it.activeFilterId) {
                active = "active";
                title = filterItem.title;
            }
            options += '<li><a href="#" class="dropdown-item smart-filter-item list-group-item clickable ' + active + ' "data-id="' + filterItem.id + '">';
            options += filterItem.title;
            options += '</a></li>';
        });

        this.$instanceWrapper.find(".smart-filter-list-group").html(options);

        if (!title) {
            title = AppLanugage.filters;
        }
        var smartFilterButtonText = '<i data-feather="filter" class="icon-16 mr5"></i>' + title;

        this.$instanceWrapper.find(".smart-filter-dropdown").html(smartFilterButtonText);

        if (filters.length) {
            this.$instanceWrapper.find(".smart-filter-dropdown-container").removeClass("hide");
            this.$instanceWrapper.find(".show-filter-form-button").find(".add-filter-text").addClass("hide");
        } else {
            this.$instanceWrapper.find(".smart-filter-dropdown-container").addClass("hide");
            this.$instanceWrapper.find(".show-filter-form-button").find(".add-filter-text").removeClass("hide");
        }

        feather.replace();
    }
    getFilters() {
        return getContextFilters(this.settings);
    }
    prepareSurchOption() {
        var settings = this.settings,
                it = this;
        if (settings.search && settings.search.show !== false) {
            var searchDom = '<div class="filter-item-box">'
                    + '<input type="search" class="custom-filter-search" name="' + settings.search.name + '" placeholder="' + settings.customLanguage.searchPlaceholder + '">'
                    + '</div>';
            it.$instanceWrapper.find(it.rightFilterSectionClsss).append(searchDom);

            var wait;
            it.$instanceWrapper.find(".custom-filter-search").keyup(function () {
                appLoader.show();

                var $search = $(this);
                clearTimeout(wait);

                wait = setTimeout(function () {
                    it.settings.filterParams[settings.search.name] = $search.val();
                    it.reloadInstance();
                }, 700);

            });
        }
    }
    prepareCollapsePannelButton() {
        if (this.settings.isMobile) {

            if (this.settings.dateRangeType || typeof this.settings.checkBoxes[0] !== 'undefined' || typeof this.settings.multiSelect[0] !== 'undefined' || typeof this.settings.radioButtons[0] !== 'undefined' || typeof this.settings.singleDatepicker[0] !== 'undefined' || typeof this.settings.rangeDatepicker[0] !== 'undefined' || typeof this.settings.filterDropdown[0] !== 'undefined') {

                var collapsePanelDom = "<div class='float-end filter-collapse-button'>\
                        <button title='" + AppLanugage.filters + "' class='dropdown-toggle btn btn-default mt0' data-bs-toggle='collapse' data-bs-target='#table-collapse-filter-" + this.randomId + "' aria-expanded='false'><i data-feather='sliders' class='icon-18'></i></button>\
                    </div>\
                    <div id='table-collapse-filter-" + this.randomId + "' class='navbar-collapse collapse w100p'></div>";

                this.$instanceWrapper.find(this.leftFilterSectionClsss).append(collapsePanelDom);
            }
        }
    }
    prepareReloadButton() {
        var it = this;
        if (it.settings.reloadSelector) {
            if (!$(it.settings.reloadSelector).length) {
                var reloadDom = '<div class="filter-item-box">'
                        + '<button class="btn btn-default" id="' + it.settings.reloadSelector.slice(1) + '"><i data-feather="refresh-cw" class="icon-16"></i></button>'
                        + '</div>';
                this.$instanceWrapper.find(this.leftFilterSectionClsss).append(reloadDom);  //bind refresh icon
            }

            if ($(it.settings.reloadSelector).length) {
                $(it.settings.reloadSelector).click(function () {
                    appLoader.show();
                    it.reloadInstance();
                });
            }
        }
    }
    showHideClearFilterButton() {
        if (this.activeFilterId) {
            this.$instanceWrapper.find(".clear-filter-button").removeClass("hide");
        } else {
            this.$instanceWrapper.find(".clear-filter-button").addClass("hide");
        }
    }
    clearAllFilters() {
        var it = this;
        it.activeFilterId = "";
        for (var key in this.filterElements) {
            var filterMap = it.filterElements[key];
            it.settings.filterParams[key] = "";
            if (filterMap) {
                filterMap.setValue("");
            }
        }

        it.showHideClearFilterButton();
    }
    prepareFilterFormShowButton() {
        if (this.settings.smartFilterIdentity) {
            var filters = this.getFilters();
            var filterText = '<span class="add-filter-text ml5">' + AppLanugage.addNewFilter + '</span>';
            if (filters.length) {
                filterText = "";
            } else {
                this.$instanceWrapper.find(".smart-filter-dropdown-container").addClass("hide");
            }
            var smartFilterDropdownDom = '<div class="filter-item-box">'
                    + '<button class="btn btn-default show-filter-form-button" type="button"><i data-feather="plus" class="icon-16"></i>' + filterText + '</button>'
                    + '</div>';

            var it = this;

            this.$instanceWrapper.find(this.leftFilterSectionClsss).append(smartFilterDropdownDom);

            this.$instanceWrapper.find(".show-filter-form-button").click(function () {
                it.showFilterForm();
            });
        }
    }
    prepareBookmarkFilterButtons() {
        if (this.settings.smartFilterIdentity) {

            var it = this;
            it.refreshBookmarkFilterButtons();

            it.$instanceWrapper.find(".filter-section-container").on('click', '.bookmarked-filter-button', function () {
                var data = $(this).data() || {},
                        filterId = data.id;
                it.state = "new_filter";
                it.applySelectedFilter(filterId);
            });
        }
    }
    refreshBookmarkFilterButtons() {
        if (this.settings.smartFilterIdentity) {
            var it = this,
                    filters = it.getFilters();
            it.$instanceWrapper.find(".bookmarked-filter-button-wrapper").remove();

            $.each(filters, function (index, filterItem) {
                if (filterItem.bookmark == "1") {
                    var bookmarkButtonContent = filterItem.title;
                    if (filterItem.icon) {
                        bookmarkButtonContent = '<i data-feather="' + filterItem.icon + '" class="icon-16"></i>';
                    }

                    var smartFilterDropdownDom = '<div class="filter-item-box bookmarked-filter-button-wrapper">'
                            + '<button class="btn btn-default bookmarked-filter-button round" type="button" data-id="' + filterItem.id + '"  >' + bookmarkButtonContent + '</button>'
                            + '</div>';
                    it.$instanceWrapper.find(it.leftFilterSectionClsss).append(smartFilterDropdownDom);
                }
            });

            feather.replace();
        }
    }

    hideFilterForm() {
        this.state = "new_filter";
        this.$instanceWrapper.find(this.filterFormClass).addClass("hide");
        this.showFilterFormButton();
    }
    showFilterForm() {
        this.$instanceWrapper.find(this.filterFormClass).removeClass("hide");
        this.hideFilterFormButton();
        this.showSaveFilterButton();
        this.updateFilterModalState();
    }
    hideFilterFormButton() {
        this.$instanceWrapper.find(".show-filter-form-button").closest(".filter-item-box").addClass("hide");
    }
    showFilterFormButton() {
        this.$instanceWrapper.find(".show-filter-form-button").closest(".filter-item-box").removeClass("hide");
    }
    updateFilterModalState(filterInfo) {
        var title = AppLanugage.newFilter;
        var $button = this.$instanceWrapper.find(".save-filter-button");

        if (this.state === "change_filter") {
            title = AppLanugage.updateFilter;
            if (filterInfo) {
                title += " (" + filterInfo.title + ")";
            }
            $button.attr("data-title", title);
            $button.attr("data-post-id", this.activeFilterId);
            $button.attr("data-post-change_filter", "1");
        } else {
            $button.attr("data-title", title);
            $button.attr("data-post-id", getRandomAlphabet(10));
            $button.attr("data-post-change_filter", "");
        }


    }
    showSaveFilterButton() {

        var filters = this.getFilters();

        if (filters.length) {
            this.$instanceWrapper.find(".save-filter-button").addClass("btn-default").removeClass("btn-success");
        } else {
            this.$instanceWrapper.find(".save-filter-button").addClass("btn-success").removeClass("btn-default");
        }

        this.$instanceWrapper.find(".save-filter-button").closest(".filter-item-box").removeClass("hide");
    }
    hideSaveSelectedFilterButton() {
        this.$instanceWrapper.find(".save-filter-button").closest(".filter-item-box").addClass("hide");
    }
    getInstanceId() {
        return this.$instance.attr("id");
    }
    getContextId() {
        if (this.settings.contextMeta && this.settings.contextMeta.contextId) {
            return this.settings.contextMeta.contextId;
        } else {
            return "";
        }
    }
    getContextDependencies() {
        if (this.settings.contextMeta && this.settings.contextMeta.dependencies) {
            return this.settings.contextMeta.dependencies;
        } else {
            return "";
        }
    }
    prepareSaveFilterButton() {
        if (this.settings.smartFilterIdentity) {
            var it = this;

            var dataPostAttrs = " data-post-context='" + it.settings.smartFilterIdentity + "' "
                    + " data-post-instance_id='" + it.getInstanceId() + "' ";

            if (it.getContextId()) {
                dataPostAttrs += " data-post-context_id= '" + it.getContextId() + "' ";
            }


            var actionUrl = AppHelper.baseUrl + "index.php/filters/modal_form";
            var smartFilterCreateButon = '<div class="filter-item-box save-filter-box hide">'
                    + '<button class="btn btn-default save-filter-button" data-act="ajax-modal" data-title="" ' + dataPostAttrs + '  type="button" data-action-url="' + actionUrl + '" ><i data-feather="check-circle" class="icon-16"></i></button>'
                    + '</div>';

            this.$instanceWrapper.find(this.filterFormClass).append(smartFilterCreateButon);
        }
    }
    prepareCancelFilterFormButton() {
        if (this.settings.smartFilterIdentity) {
            var it = this;

            var smartFilterCancelButton = '<div class="filter-item-box filter-cancel-box">'
                    + '<button class="btn btn-default cancel-filter-button" type="button" ><i data-feather="x-circle" class="icon-16"></i></button>'
                    + '</div>';


            this.$instanceWrapper.find(this.filterFormClass).append(smartFilterCancelButton);

            this.$instanceWrapper.find(".cancel-filter-button").click(function () {
                it.hideFilterForm();
            });

        }
    }
    appendFilterDom(dom) {
        if (this.settings.smartFilterIdentity) {
            this.$instanceWrapper.find(this.filterFormClass).append(dom);
        } else if (this.settings.isMobile) {
            //append to collapse panel on mobile device
            this.$instanceWrapper.find("#table-collapse-filter-" + this.randomId).append(dom);
        } else {
            this.$instanceWrapper.find(this.leftFilterSectionClsss).append(dom);
        }
    }
    prepareDateRangePicker() {

        var it = this,
                settings = this.settings,
                $instance = this.$instance,
                $instanceWrapper = this.$instanceWrapper;



        if (settings.dateRangeType) {
            var dateRangeFilterDom = '<div class="filter-item-box btn-group">'
                    + '<button data-act="prev" class="btn btn-default date-range-selector"><i data-feather="chevron-left" class="icon"></i></button>'
                    + '<button data-act="datepicker" class="btn btn-default"></button>'
                    + '<button data-act="next"  class="btn btn-default date-range-selector"><i data-feather="chevron-right" class="icon"></i></button>'
                    + '</div>';

            this.appendFilterDom(dateRangeFilterDom);

            var $datepicker = $instanceWrapper.find("[data-act='datepicker']"),
                    $dateRangeSelector = $instanceWrapper.find(".date-range-selector");

            //init single day selector
            if (settings.dateRangeType === "daily") {
                var initSingleDaySelectorText = function ($elector) {
                    if (settings.filterParams.start_date === moment().format(settings._inputDateFormat)) {
                        $elector.html(settings.customLanguage.today);
                    } else if (settings.filterParams.start_date === moment().subtract(1, 'days').format(settings._inputDateFormat)) {
                        $elector.html(settings.customLanguage.yesterday);
                    } else if (settings.filterParams.start_date === moment().add(1, 'days').format(settings._inputDateFormat)) {
                        $elector.html(settings.customLanguage.tomorrow);
                    } else {
                        $elector.html(moment(settings.filterParams.start_date).format("Do MMMM YYYY"));
                    }
                };
                // prepareDefaultDateRangeFilterParams();
                initSingleDaySelectorText($datepicker);

                //bind the click events
                $datepicker.datepicker({
                    format: settings._inputDateFormat,
                    autoclose: true,
                    todayHighlight: true,
                    language: "custom",
                    orientation: "bottom"
                }).on('changeDate', function (e) {
                    var date = moment(e.date).format(settings._inputDateFormat);
                    settings.filterParams.start_date = date;
                    settings.filterParams.end_date = date;
                    initSingleDaySelectorText($datepicker);

                    it.reloadInstance();

                });

                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"), date = "";
                    if (type === "next") {
                        date = moment(settings.filterParams.start_date).add(1, 'days').format(settings._inputDateFormat);
                    } else if (type === "prev") {
                        date = moment(settings.filterParams.start_date).subtract(1, 'days').format(settings._inputDateFormat)
                    }
                    settings.filterParams.start_date = date;
                    settings.filterParams.end_date = date;
                    initSingleDaySelectorText($datepicker);
                    it.reloadInstance();
                });

                it.filterElements['start_date'] = {
                    setValue: function (value) {
                        $datepicker.datepicker('update', value);
                        initSingleDaySelectorText($datepicker);
                    }
                };

            }


            //init month selector
            if (settings.dateRangeType === "monthly") {
                var initMonthSelectorText = function ($elector) {
                    $elector.html(moment(settings.filterParams.start_date).format("MMMM YYYY"));
                };

                //prepareDefaultDateRangeFilterParams();
                initMonthSelectorText($datepicker);

                //bind the click events
                $datepicker.datepicker({
                    format: "YYYY-MM",
                    viewMode: "months",
                    minViewMode: "months",
                    autoclose: true,
                    language: "custom",
                    orientation: "bottom"
                }).on('changeDate', function (e) {
                    var date = moment(e.date).format(settings._inputDateFormat);
                    var daysInMonth = moment(date).daysInMonth(),
                            yearMonth = moment(date).format("YYYY-MM");
                    settings.filterParams.start_date = yearMonth + "-01";
                    settings.filterParams.end_date = yearMonth + "-" + daysInMonth;
                    initMonthSelectorText($datepicker);
                    it.reloadInstance();
                });

                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"),
                            startDate = moment(settings.filterParams.start_date),
                            endDate = moment(settings.filterParams.end_date);
                    if (type === "next") {
                        var nextMonth = startDate.add(1, 'months'),
                                daysInMonth = nextMonth.daysInMonth(),
                                yearMonth = nextMonth.format("YYYY-MM");

                        startDate = yearMonth + "-01";
                        endDate = yearMonth + "-" + daysInMonth;

                    } else if (type === "prev") {
                        var lastMonth = startDate.subtract(1, 'months'),
                                daysInMonth = lastMonth.daysInMonth(),
                                yearMonth = lastMonth.format("YYYY-MM");

                        startDate = yearMonth + "-01";
                        endDate = yearMonth + "-" + daysInMonth;
                    }

                    settings.filterParams.start_date = startDate;
                    settings.filterParams.end_date = endDate;

                    initMonthSelectorText($datepicker);
                    it.reloadInstance();
                });

                it.filterElements['start_date'] = {
                    setValue: function (value) {
                        $datepicker.datepicker('update', value);
                        initMonthSelectorText($datepicker);
                    }
                };
            }

            //init year selector
            if (settings.dateRangeType === "yearly") {
                var inityearSelectorText = function ($elector) {
                    $elector.html(moment(settings.filterParams.start_date).format("YYYY"));
                };
                // prepareDefaultDateRangeFilterParams();
                inityearSelectorText($datepicker);

                //bind the click events
                $datepicker.datepicker({
                    format: "YYYY-MM",
                    viewMode: "years",
                    minViewMode: "years",
                    autoclose: true,
                    language: "custom",
                    orientation: "bottom"
                }).on('changeDate', function (e) {
                    var date = moment(e.date).format(settings._inputDateFormat),
                            year = moment(date).format("YYYY");
                    settings.filterParams.start_date = year + "-01-01";
                    settings.filterParams.end_date = year + "-12-31";
                    inityearSelectorText($datepicker);
                    it.reloadInstance();
                });

                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"),
                            startDate = moment(settings.filterParams.start_date),
                            endDate = moment(settings.filterParams.end_date);
                    if (type === "next") {
                        startDate = startDate.add(1, 'years').format(settings._inputDateFormat);
                        endDate = endDate.add(1, 'years').format(settings._inputDateFormat);
                    } else if (type === "prev") {
                        startDate = startDate.subtract(1, 'years').format(settings._inputDateFormat);
                        endDate = endDate.subtract(1, 'years').format(settings._inputDateFormat);
                    }
                    settings.filterParams.start_date = startDate;
                    settings.filterParams.end_date = endDate;
                    inityearSelectorText($datepicker);
                    it.reloadInstance();
                });


                it.filterElements['start_date'] = {
                    setValue: function (value) {
                        $datepicker.datepicker('update', value);
                        inityearSelectorText($datepicker);
                    }
                };
            }

            //init week selector
            if (settings.dateRangeType === "weekly") {
                var initWeekSelectorText = function ($elector) {
                    var from = moment(settings.filterParams.start_date).format("Do MMM"),
                            to = moment(settings.filterParams.end_date).format("Do MMM, YYYY");
                    $datepicker.datepicker({
                        format: "YYYY-MM-DD",
                        autoclose: true,
                        calendarWeeks: true,
                        language: "custom",
                        orientation: "bottom",
                        weekStart: AppHelper.settings.firstDayOfWeek
                    });
                    $elector.html(from + " - " + to);
                };

                //prepareDefaultDateRangeFilterParams();
                initWeekSelectorText($datepicker);

                //bind the click events
                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"),
                            startDate = moment(settings.filterParams.start_date),
                            endDate = moment(settings.filterParams.end_date);
                    if (type === "next") {
                        startDate = startDate.add(7, 'days').format(settings._inputDateFormat);
                        endDate = endDate.add(7, 'days').format(settings._inputDateFormat);
                    } else if (type === "prev") {
                        startDate = startDate.subtract(7, 'days').format(settings._inputDateFormat);
                        endDate = endDate.subtract(7, 'days').format(settings._inputDateFormat);
                    }
                    settings.filterParams.start_date = startDate;
                    settings.filterParams.end_date = endDate;
                    initWeekSelectorText($datepicker);
                    it.reloadInstance();
                });

                $datepicker.datepicker({
                    format: settings._inputDateFormat,
                    autoclose: true,
                    calendarWeeks: true,
                    language: "custom",
                    weekStart: AppHelper.settings.firstDayOfWeek
                }).on("show", function () {
                    $(".datepicker").addClass("week-view");
                    $(".datepicker-days").find(".active").siblings(".day").addClass("active");
                }).on('changeDate', function (e) {
                    var range = getWeekRange(e.date);
                    settings.filterParams.start_date = range.firstDateOfWeek;
                    settings.filterParams.end_date = range.lastDateOfWeek;
                    initWeekSelectorText($datepicker);
                    it.reloadInstance();
                });

                it.filterElements['start_date'] = {
                    setValue: function (value) {
                        $datepicker.datepicker('update', value);
                        initWeekSelectorText($datepicker);
                    }
                };
            }
        }
    }
    prepareDropdownFilters() {
        var settings = this.settings,
                it = this,
                $instance = this.$instance,
                $instanceWrapper = this.$instanceWrapper;

        if (typeof settings.filterDropdown[0] !== 'undefined') {

            $.each(settings.filterDropdown, function (index, dropdown) {

                var options = "",
                        selectedValue = "";

                var selectHtmlData = [];

                $.each(dropdown.options, function (index, option) {
                    var isSelected = "";
                    if (option.isSelected) {
                        isSelected = "selected";
                        selectedValue = option.id;
                    }

                    if (dropdown.showHtml) {
                        selectHtmlData.push({
                            id: option.id,
                            text: option.text
                        });
                    } else {
                        options += '<option ' + isSelected + ' value="' + option.id + '">' + option.text + '</option>';
                    }
                });

                if (dropdown.name) {
                    settings.filterParams[dropdown.name] = selectedValue;
                }

                var selectDomSelector = '<select class="' + dropdown.class + '" name="' + dropdown.name + '">'
                        + options
                        + '</select>';

                if (dropdown.showHtml) {
                    selectDomSelector = '<input class="' + dropdown.class + '" name="' + dropdown.name + '" />';
                }

                var selectDom = '<div class="filter-item-box">'
                        + selectDomSelector
                        + '</div>';

                it.appendFilterDom(selectDom);

                var $dropdown = $instanceWrapper.find("[name='" + dropdown.name + "']");
                if (window.Select2 !== undefined) {
                    if (dropdown.showHtml) {
                        $dropdown.select2({
                            data: selectHtmlData,
                            escapeMarkup: function (markup) {
                                return markup;
                            }
                        });
                    } else {
                        $dropdown.select2();
                    }

                }

                $dropdown.change(function () {
                    var $selector = $(this),
                            filterName = $selector.attr("name"),
                            value = $selector.val();

                    //set the new value to settings
                    settings.filterParams[filterName] = value;

                    //check if there any dependent files,
                    //reset the dependent fields if this value is empty
                    //re-load the dependent fields if this value is not empty

                    if (dropdown.dependent && dropdown.dependent.length) {
                        it.prepareDependentFilter(filterName, value, settings.filterDropdown, settings.filterParams);
                    }

                    //callback
                    if (dropdown.onChangeCallback) {
                        dropdown.onChangeCallback(value, settings.filterParams);
                    }

                    it.reloadInstance();
                });

                it.filterElements[dropdown.name] = {
                    setValue: function (value, newFilterParams) {
                        $dropdown.select2("val", value);
                        if (dropdown.showHtml && !value) {
                            if (selectHtmlData[0] && !selectHtmlData[0].id && selectHtmlData[0].text) {
                                $dropdown.siblings(".select2-container").find(".select2-chosen").html(selectHtmlData[0].text);
                            }
                        }

                        window[dropdown.name] = $dropdown;
                        if (dropdown.dependent && dropdown.dependent.length) {
                            it.prepareDependentFilter(dropdown.name, value, settings.filterDropdown, settings.filterParams, newFilterParams);
                        }

                        if (dropdown.onChangeCallback) {
                            dropdown.onChangeCallback(value, newFilterParams);
                        }
                    }
                };


            });
        }
    }
    prepareDatePickerFilter() {
        var settings = this.settings,
                it = this,
                $instance = this.$instance,
                $instanceWrapper = this.$instanceWrapper;

        if (typeof settings.rangeDatepicker[0] !== 'undefined') {

            $.each(settings.rangeDatepicker, function (index, datePicker) {

                var startDate = datePicker.startDate || {},
                        endDate = datePicker.endDate || {},
                        showClearButton = datePicker.showClearButton ? true : false,
                        emptyText = '<i data-feather="calendar" class="icon-16"></i>',
                        startButtonText = startDate.value ? moment(startDate.value, settings._inputDateFormat).format("Do MMMM YYYY") : emptyText,
                        endButtonText = endDate.value ? moment(endDate.value, settings._inputDateFormat).format("Do MMMM YYYY") : emptyText;

                //set filter params
                settings.filterParams[startDate.name] = startDate.value;
                settings.filterParams[endDate.name] = endDate.value;

                var reloadDateRangeFilter = function (name, date) {
                    settings.filterParams[name] = date;
                    it.reloadInstance();
                };


                var defaultRanges = {'today': [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")],
                    'yesterday': [moment().subtract(1, 'days').format("YYYY-MM-DD"), moment().subtract(1, 'days').format("YYYY-MM-DD")],
                    'tomorrow': [moment().add(1, 'days').format("YYYY-MM-DD"), moment().add(1, 'days').format("YYYY-MM-DD")],
                    'last_7_days': [moment().subtract(6, 'days').format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")],
                    'next_7_days': [moment().format("YYYY-MM-DD"), moment().add(6, 'days').format("YYYY-MM-DD")],
                    'last_30_days': [moment().subtract(29, 'days').format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")],
                    'this_month': [moment().startOf('month').format("YYYY-MM-DD"), moment().endOf('month').format("YYYY-MM-DD")],
                    'last_month': [moment().subtract(1, 'month').startOf('month').format("YYYY-MM-DD"), moment().subtract(1, 'month').endOf('month').format("YYYY-MM-DD")],
                    'next_month': [moment().add(1, 'month').startOf('month').format("YYYY-MM-DD"), moment().add(1, 'month').endOf('month').format("YYYY-MM-DD")],
                    'this_year': [moment().startOf('year').format("YYYY-MM-DD"), moment().endOf('year').format("YYYY-MM-DD")],
                    'next_year': [moment().add(1, 'year').startOf('year').format("YYYY-MM-DD"), moment().add(1, 'year').endOf('year').format("YYYY-MM-DD")],
                    'last_year': [moment().subtract(1, 'year').startOf('year').format("YYYY-MM-DD"), moment().subtract(1, 'year').endOf('year').format("YYYY-MM-DD")]
                };


                var devider = '<span class="input-group-addon">-</span>';
                var showRange = false;

                if (datePicker.label) {
                    devider = '<span class="input-group-addon custom-date-range-lable">' + datePicker.label + '</span>';


                    if (datePicker.ranges) {

                        var options = "";
                        $.each(datePicker.ranges, function (index, range) {
                            if (defaultRanges[range]) {
                                options += '<li><a href="#" class="dropdown-item list-group-item clickable" data-range="' + range + '">';
                                options += AppLanugage[range];
                                options += '</a></li>';
                            }
                        });
                        if (options) {
                            showRange = true;
                            var rangeDropdownDom = ''
                                    + '<div class="dropdown">'
                                    + '<div class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="true">' + datePicker.label + '</div>'
                                    + '<div class="dropdown-menu">'
                                    + '<ul class="list-group">' + options + '</ul>'
                                    + '</div>'
                                    + '</div>'
                                    ;

                            devider = '<span class="input-group-addon custom-date-range-dropdown clickable">' + rangeDropdownDom + '</span>';

                        }

                    }
                }


                var dateRangeClass = "daterange-" + getRandomAlphabet(5);

                //prepare DOM
                var selectDom = '<div class="filter-item-box">'
                        + '<div class="input-daterange input-group ' + dateRangeClass + '">'
                        + '<button class="btn btn-default form-control" name="' + startDate.name + '" data-date="' + startDate.value + '">' + startButtonText + '</button>'
                        + devider
                        + '<button class="btn btn-default form-control" name="' + endDate.name + '" data-date="' + endDate.value + '">' + endButtonText + ''
                        + '</div>'
                        + '</div>';

                it.appendFilterDom(selectDom);

                var $datePicker = $instanceWrapper.find("." + dateRangeClass),
                        inputs = $datePicker.find('button').toArray();

                var showButtonText = function () {
                    var s_date = settings.filterParams[startDate.name],
                            e_date = settings.filterParams[endDate.name];
                    $(inputs[0]).html(s_date ? moment(s_date, settings._inputDateFormat).format("Do MMMM YYYY") : emptyText);
                    $(inputs[1]).html(e_date ? moment(e_date, settings._inputDateFormat).format("Do MMMM YYYY") : emptyText);
                };

                //init datepicker
                $datePicker.datepicker({
                    format: "yyyy-mm-dd",
                    autoclose: true,
                    todayHighlight: true,
                    language: "custom",
                    weekStart: AppHelper.settings.firstDayOfWeek,
                    orientation: "bottom",
                    inputs: inputs
                }).on('changeDate', function (e) {
                    var date = moment(e.date, settings._inputDateFormat).format(settings._inputDateFormat);

                    //set save value if anyone is empty
                    if (!settings.filterParams[startDate.name]) {
                        settings.filterParams[startDate.name] = date;
                    }

                    if (!settings.filterParams[endDate.name]) {
                        settings.filterParams[endDate.name] = date;
                    }

                    reloadDateRangeFilter($(e.target).attr("name"), date);

                    //show button text
                    showButtonText();

                }).on("show", function () {

                    //show clear button
                    if (showClearButton) {
                        $(".datepicker-clear-selection").show();
                        if (!$(".datepicker-clear-selection").length) {
                            $(".datepicker").append("<div class='datepicker-clear-selection p5 clickable text-center'>" + AppLanugage.clear + "</div>");

                            //bind click event for clear button
                            $(".datepicker .datepicker-clear-selection").click(function () {
                                settings.filterParams[startDate.name] = "";
                                reloadDateRangeFilter(endDate.name, "");

                                $(inputs[0]).html(emptyText);
                                $(inputs[1]).html(emptyText);
                                $(".datepicker").hide();
                            });
                        }
                    }
                });


                if (showRange) {
                    it.$instanceWrapper.find("." + dateRangeClass).on('click', '.list-group-item', function () {
                        var data = $(this).data() || {};
                        var date = defaultRanges[data.range];
                        settings.filterParams[endDate.name] = date[1];

                        reloadDateRangeFilter(startDate.name, date[0]);

                        showButtonText();
                    });
                }


                it.filterElements[startDate.name] = {
                    setValue: function (value) {
                        $datePicker.datepicker('update', value);
                        showButtonText();
                    }
                };
                it.filterElements[endDate.name] = {
                    setValue: function (value) {
                        $datePicker.datepicker('update', value);
                        showButtonText();
                    }
                };

            });
        }
    }
    prepareSingleDatePicker() {
        var settings = this.settings,
                it = this,
                $instance = this.$instance,
                $instanceWrapper = this.$instanceWrapper;

        if (typeof settings.singleDatepicker[0] !== 'undefined') {

            $.each(settings.singleDatepicker, function (index, datePicker) {

                var options = " ", value = "", selectedText = "";

                if (!datePicker.options)
                    datePicker.options = [];

                //add custom datepicker selector
                datePicker.options.push({value: "show-date-picker", text: AppLanugage.custom});

                //prepare custom list
                $.each(datePicker.options, function (index, option) {
                    var isSelected = "";
                    if (option.isSelected) {
                        isSelected = "active";
                        value = option.value;
                        selectedText = option.text;
                    }

                    options += '<div class="list-group-item ' + isSelected + '" data-value="' + option.value + '">' + option.text + '</div>';
                });

                if (!selectedText) {
                    selectedText = "- " + datePicker.defaultText + " -";
                    options = '<div class="list-group-item active" data-value="">' + selectedText + '</div>' + options;
                }



                //set filter params
                if (datePicker.name) {
                    settings.filterParams[datePicker.name] = value;
                }

                var reloadDatePickerFilter = function (date) {
                    settings.filterParams[datePicker.name] = date;
                    it.reloadInstance();
                };

                var getDatePickerText = function (text) {
                    return text + "<span class='ml10 dropdown-toggle'></span>";
                };



                //prepare DOM
                var customList = '<div class="datepicker-custom-list list-group mb0">'
                        + options
                        + '</div>';

                var datePickerClass = "";
                if (datePicker.class) {
                    datePickerClass = datePicker.class;
                }


                var selectDom = '<div class="filter-item-box">'
                        + '<button name="' + datePicker.name + '" class="btn ' + datePickerClass + ' datepicker-custom-selector">'
                        + getDatePickerText(selectedText)
                        + '</button>'
                        + '</div>';

                it.appendFilterDom(selectDom);

                var $datePicker = $instanceWrapper.find("[name='" + datePicker.name + "']"),
                        showCustomRange = typeof datePicker.options[1] === 'undefined' ? false : true; //don't show custom range if options not > 1

                //init datepicker
                $datePicker.datepicker({
                    format: settings._inputDateFormat,
                    autoclose: true,
                    todayHighlight: true,
                    language: "custom",
                    weekStart: AppHelper.settings.firstDayOfWeek,
                    orientation: "bottom"
                }).on("show", function () {

                    //has custom dates, show them otherwise show the datepicker
                    if (showCustomRange) {
                        $(".datepicker-days, .datepicker-months, .datepicker-years, .datepicker-decades, .table-condensed").hide();
                        $(".datepicker-custom-list").show();
                        if (!$(".datepicker-custom-list").length) {
                            $(".datepicker").append(customList);

                            //bind click events
                            $(".datepicker .list-group-item").click(function () {
                                $(".datepicker .list-group-item").removeClass("active");
                                $(this).addClass("active");
                                var value = $(this).attr("data-value");
                                //show datepicker for custom date
                                if (value === "show-date-picker") {
                                    $(".datepicker-custom-list, .datepicker-months, .datepicker-years, .datepicker-decades, .table-condensed").hide();
                                    $(".datepicker-days, .table-condensed").show();
                                } else {
                                    $(".datepicker").hide();

                                    if (moment(value, settings._inputDateFormat).isValid()) {
                                        value = moment(value, settings._inputDateFormat).format(settings._inputDateFormat);
                                    }

                                    $datePicker.html(getDatePickerText($(this).html()));
                                    reloadDatePickerFilter(value);
                                }
                            });
                        }
                    }
                }).on('changeDate', function (e) {
                    $datePicker.html(getDatePickerText(moment(e.date, settings._inputDateFormat).format("Do MMMM YYYY")));
                    reloadDatePickerFilter(moment(e.date, settings._inputDateFormat).format(settings._inputDateFormat));
                });

                it.filterElements[datePicker.name] = {
                    setValue: function (value) {
                        $datePicker.datepicker('update', value);
                        //prepare custom list
                        var text = "";

                        $.each(datePicker.options, function (index, option) {
                            if (value === option.value) {
                                text = option.text;
                            }
                        });

                        if (value && text) {
                            $datePicker.html(getDatePickerText(text));
                        } else if (value) {
                            $datePicker.html(getDatePickerText(moment(value, settings._inputDateFormat).format("Do MMMM YYYY")));
                        } else if (datePicker.defaultText) {
                            $datePicker.html(getDatePickerText(datePicker.defaultText)); //set default text if option if don't have any value
                        }

                        $(".datepicker .list-group-item").removeClass("active");
                        $(".datepicker .list-group-item").each(function () {
                            if (value === $(this).attr("data-value")) {
                                $(this).addClass("active");
                            }
                        });
                    }
                };

            });
        }
    }
    prepareRadioFilter() {
        var settings = this.settings,
                it = this,
                $instance = this.$instance,
                $instanceWrapper = this.$instanceWrapper;

        if (typeof settings.radioButtons[0] !== 'undefined') {
            var radiobuttons = "",
                    filterName = "";
            $.each(settings.radioButtons, function (index, option) {
                var checked = "", active = "";
                filterName = option.name;
                if (option.isChecked) {
                    checked = " checked";
                    active = " active";
                    settings.filterParams[option.name] = option.value;
                }
                radiobuttons += '<label class="btn btn-default mb0 ' + active + '">';
                radiobuttons += '<input type="radio" name="' + option.name + '" value="' + option.value + '" autocomplete="off" ' + checked + '>' + option.text;
                radiobuttons += '</label>';
            });
            var radioDom = '<div class="filter-item-box">'
                    + '<div class="btn-group filter" data-act="radio" data-toggle="buttons">'
                    + radiobuttons
                    + '</div>'
                    + '</div>';

            it.appendFilterDom(radioDom);

            var $radioButtons = $instanceWrapper.find("[data-act='radio'] input[type=radio]");



            $radioButtons.click(function () {

                setTimeout(function () {
                    $radioButtons.each(function () {
                        $(this).closest("label").removeClass("active");
                        if ($(this).is(":checked")) {
                            settings.filterParams[$(this).attr("name")] = $(this).val();
                            $(this).closest("label").addClass("active");
                        }
                    });
                    it.reloadInstance();

                });
            });

            it.filterElements[filterName] = {

                setValue: function (value) {
                    $radioButtons.each(function () {
                        $(this).closest("label").removeClass("active");
                        if ($(this).val() == value) {
                            $(this).closest("label").addClass("active");
                            $(this).prop("checked", true);
                        } else {
                            $(this).prop("checked", false);
                        }
                    });
                }
            };


        }
    }
    prepareMultiselectFilter() {
        var settings = this.settings,
                it = this,
                $instance = this.$instance,
                $instanceWrapper = this.$instanceWrapper;

        if (typeof settings.multiSelect[0] !== 'undefined') {

            $.each(settings.multiSelect, function (index, select) {

                var multiSelect = "", values = [],
                        saveSelection = select.saveSelection,
                        selections = getCookie(select.name);

                if (selections) {
                    selections = selections.split("-");
                }

                $.each(select.options, function (index, listOption) {
                    var active = "";

                    if (
                            (saveSelection && selections && (selections.indexOf(listOption.value) > -1)) ||
                            (saveSelection && !selections && listOption.isChecked) ||
                            (!saveSelection && listOption.isChecked)
                            ) {
                        active = " active";
                        values.push(listOption.value);
                    }
                    //<li class=" list-group-item clickable toggle-table-column" data-column="1">ID</li>
                    multiSelect += '<li class="list-group-item clickable ' + active + '" data-name="' + select.name + '" data-value="' + listOption.value + '">';
                    multiSelect += listOption.text;
                    multiSelect += '</li>';
                });


                multiSelect = "<div class='dropdown-menu'><ul class='list-group' data-act='multiselect'>" + multiSelect + "</ul></div>";


                var multiSelectClass = "";
                if (select.class) {
                    multiSelectClass = select.class;
                }


                settings.filterParams[select.name] = values;
                var multiSelectDom = '<div class="filter-item-box">'
                        + '<span class="dropdown inline-block filter-multi-select">'
                        + '<button class="' + multiSelectClass + ' btn btn-default dropdown-toggle caret " type="button" data-bs-toggle="dropdown" aria-expanded="true">' + select.text + ' </button>'
                        + multiSelect
                        + '</span>'
                        + '</div>';

                it.appendFilterDom(multiSelectDom);

                var $multiSelect = $instanceWrapper.find("[data-name='" + select.name + "']");
                $multiSelect.click(function () {
                    var $selector = $(this);
                    $selector.toggleClass("active");
                    setTimeout(function () {
                        var values = [],
                                name = "";
                        $selector.parent().find("li").each(function () {
                            name = $(this).attr("data-name");
                            if ($(this).hasClass("active")) {
                                values.push($(this).attr("data-value"));
                            }
                        });

                        if (saveSelection) {
                            //save selected options to browser cookies
                            selections = values.join("-");
                            setCookie(select.name, selections);
                        }

                        settings.filterParams[name] = values;
                        it.reloadInstance();
                    });
                    return false;
                });


                it.filterElements[select.name] = {

                    setValue: function (values) {
                        if (!values) {
                            values = [];
                        }
                        $multiSelect.each(function () {

                            if (values.includes($(this).attr("data-value"))) {
                                $(this).addClass("active");
                            } else {
                                $(this).removeClass("active");
                            }

                        });
                    }
                };

            });


        }

    }
    prepareCheckboxFilter() {
        var settings = this.settings,
                it = this,
                $instance = this.$instance,
                $instanceWrapper = this.$instanceWrapper;

        if (typeof settings.checkBoxes[0] !== 'undefined') {
            var checkboxes = "", values = [], name = "";
            $.each(settings.checkBoxes, function (index, option) {
                var checked = "", active = "";
                name = option.name;
                if (option.isChecked) {
                    checked = " checked";
                    active = " active";
                    values.push(option.value);
                }
                checkboxes += '<label class="btn btn-default mb0 ' + active + '">';
                checkboxes += '<input type="checkbox" name="' + option.name + '" value="' + option.value + '" autocomplete="off" ' + checked + '>' + option.text;
                checkboxes += '</label>';
            });
            settings.filterParams[name] = values;
            var checkboxDom = '<div class="filter-item-box">'
                    + '<div class="btn-group filter" data-act="checkbox" data-toggle="buttons">'
                    + checkboxes
                    + '</div>'
                    + '</div>';

            it.appendFilterDom(checkboxDom);

            var $checkbox = $instanceWrapper.find("[data-act='checkbox']");
            $checkbox.click(function () {
                var $selector = $(this);
                setTimeout(function () {
                    var values = [],
                            name = "";
                    $selector.parent().find("input:checkbox").each(function () {
                        name = $(this).attr("name");
                        if ($(this).is(":checked")) {
                            values.push($(this).val());
                            $(this).closest("label").addClass("active");
                        } else {
                            $(this).closest("label").removeClass("active");
                        }
                    });
                    settings.filterParams[name] = values;
                    it.reloadInstance();
                });
            });



            it.filterElements[name] = {
                setValue: function (values) {
                    if (!values) {
                        values = [];
                    }
                    $instanceWrapper.find("input:checkbox").each(function () {
                        //it'll find all checkboxes. Match with name
                        if (name === $(this).attr("name")) {
                            if (values.includes($(this).val())) {
                                $(this).closest("label").addClass("active");
                            } else {
                                $(this).closest("label").removeClass("active");
                            }
                        }
                    });
                }
            };


        }

    }
    prepareDependentFilter(filterName, filterValue, filterDropdown, filterParams, newFilterParams) {

        var
                it = this,
                $instanceWrapper = this.$instanceWrapper;

        //check all dropdowns and prepre the dependency dropdown list

        $.each(filterDropdown, function (index, option) {

            //is there any dependency for selected field (filterName)? Prepare the dropdown list 
            if (option.dependency && option.dependency.length && option.dependency.indexOf(filterName) !== -1) {

                var $dependencySelector = $instanceWrapper.find("select[name=" + option.name + "]"); //select box
                var dependentFilterName = option.name;

                //we'll call ajax to get the data list
                if (((option.selfDependency && !filterValue) || filterValue) && option.dataSource) {
                    $.ajax({
                        url: option.dataSource,
                        data: filterParams,
                        type: "POST",
                        dataType: 'json',
                        success: function (response) {
                            //if we found the dropdown list, we'll show the options in dropdown
                            if (response && response.length) {
                                var newOptions = "",
                                        firstValue = "";

                                $.each(response, function (index, value) {

                                    if (!index) {
                                        firstValue = value.id; //auto select the first option in select box
                                    }

                                    newOptions += "<option value='" + value.id + "'>" + value.text + "</option>";
                                });

                                //set the new dropdown list in select box
                                $dependencySelector.html(newOptions);


                                if (newFilterParams && newFilterParams[dependentFilterName]) {
                                    $dependencySelector.select2("val", newFilterParams[dependentFilterName]);
                                } else {
                                    $dependencySelector.select2("val", firstValue);
                                }
                            }
                        }
                    });

                } else {
                    //no value selected in parent, reset the dropdown box

                    var $firstOption = $dependencySelector.find("option:first");
                    $dependencySelector.html("<option value='" + $firstOption.val() + "'>" + $firstOption.html() + "</option>");
                    $dependencySelector.select2("val", $firstOption.val());
                }

                //reset the filter param
                if (filterParams && newFilterParams && newFilterParams[dependentFilterName]) {
                    filterParams[dependentFilterName] = newFilterParams[dependentFilterName];
                } else if (filterParams) {
                    var $firstOption = $dependencySelector.find("option:first");
                    filterParams[option.name] = $firstOption.val();
                }

            }

        });

    }
}

var buildFilterDom = function (settings, $instanceWrapper, $instance) {
    var filters = new BuildFilters(settings, $instanceWrapper, $instance);
    filters.init();
};

if (typeof TableTools != 'undefined') {
    TableTools.DEFAULTS.sSwfPath = AppHelper.assetsDirectory + "js/datatable/TableTools/swf/copy_csv_xls_pdf.swf";
}

var $appFilterXhrRequest = 'new';

(function ($) {
    //appTable using datatable
    $.fn.appTable = function (options) {

        //set default display length
        var displayLength = AppHelper.settings.displayLength * 1;

        if (isNaN(displayLength) || !displayLength) {
            displayLength = 10;
        }

        var responsive = false;
        if (AppHelper.settings.disableResponsiveDataTable === "1") {
            responsive = false;
        } else if ((AppHelper.settings.disableResponsiveDataTableForMobile !== "1") && (window.outerWidth < 800)) {
            responsive = true;
        }

        var defaults = {
            serverSide: false,
            smartFilterIdentity: null, //a to z and _ only. should be unique to avoid conflicts 
            ignoreSavedFilter: false, //sometimes, need to click on widget link to show specific filter. Enable for that. 
            source: "", //data url
            xlsColumns: [], // array of excel exportable column numbers
            pdfColumns: [], // array of pdf exportable column numbers
            printColumns: [], // array of printable column numbers
            columns: [], //column title and options
            order: [[0, "asc"]], //default sort value
            hideTools: false, //show/hide tools section
            displayLength: displayLength, //default rows per page
            dateRangeType: "", // type: daily, weekly, monthly, yearly. output params: start_date and end_date
            checkBoxes: [], // [{text: "Caption", name: "status", value: "in_progress", isChecked: true}] 
            multiSelect: [], // [{text: "Caption", name: "status", options:[{text: "Caption", value: "in_progress", isChecked: true}]}] 
            radioButtons: [], // [{text: "Caption", name: "status", value: "in_progress", isChecked: true}] 
            filterDropdown: [], // [{id: 10, text:'Caption', isSelected:true}] 
            singleDatepicker: [], // [{name: '', value:'', options:[]}] 
            rangeDatepicker: [], // [{startDate:{name:"", value:""},endDate:{name:"", value:""}}] 
            stateSave: true, //save user state
            isMobile: window.outerWidth < 800 ? true : false,
            responsive: responsive, //by default, apply the responsive design only on the mobile view
            stateDuration: 60 * 60 * 24 * 60, //remember for 60 days
            columnShowHideOption: true, //show a option to show/hide the columns,
            tableRefreshButton: false, //show a option to refresh the table
            filterParams: {datatable: true}, //will post this vales on source url
            onDeleteSuccess: function () {
            },
            onUndoSuccess: function () {
            },
            onInitComplete: function () {
            },
            customLanguage: {
                noRecordFoundText: AppLanugage.noRecordFound,
                searchPlaceholder: AppLanugage.search,
                printButtonText: AppLanugage.print,
                excelButtonText: AppLanugage.excel,
                printButtonToolTip: AppLanugage.printButtonTooltip,
                today: AppLanugage.today,
                yesterday: AppLanugage.yesterday,
                tomorrow: AppLanugage.tomorrow
            },
            footerCallback: function (row, data, start, end, display) {
            },
            rowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            },
            summation: "", /* {column: 5, dataType: 'currency'}  dataType:currency, time */
            onRelaodCallback: function () {
            }
        };

        var $instance = $(this);

        //check if this binding with a table or not
        if (!$instance.is("table")) {
            console.log("appTable: Element must have to be a table", this);
            return false;
        }

        $instance.on('length.dt page.dt order.dt search.dt', function () {
            setTimeout(function () {
                feather.replace();
            }, 1);
        });

        var settings = $.extend({}, defaults, options);


        // reload

        if (settings.reload) {
            var table = $(this).dataTable();
            var instanceSettings = window.InstanceCollection[$(this).attr("id")];

            if (!instanceSettings) {
                instanceSettings = settings;
            }
            var tableId = table.get(0).id;

            if (instanceSettings.serverSide) {
                window.appTables[tableId]._fnReDraw();
            } else {
                table.fnReloadAjax(instanceSettings.filterParams);
            }




            if ($(this).data("onRelaodCallback")) {
                $(this).data("onRelaodCallback")(table, instanceSettings.filterParams);
            }

            return false;
        }

        // add/edit row
        if (settings.newData) {

            var table = $(this).dataTable();

            if (settings.dataId) {
                //check for existing row; if found, delete the row; 

                var $row = $(this).find("[data-post-id='" + settings.dataId + "']");

                if (!$row.length) {
                    $row = $(this).find("[data-index-id='" + settings.dataId + "']");
                }

                if ($row.length) {
                    // .fnDeleteRow($row.closest('tr'));

                    table.api().row(table.api().row($row.closest('tr')).index()).data(settings.newData);

                    table.fnUpdateRow(null, table.api().page()); //update existing row
                } else {
                    table.fnUpdateRow(settings.newData); //add new row
                }


            } else if (settings.rowDeleted) {
                table.fnUpdateRow(settings.newData, table.api().page(), true); //refresh row after delete
            } else {
                table.fnUpdateRow(settings.newData); //add new row
            }

            return false;
        }

        //add nowrap class in responsive view
        if (settings.responsive) {
            $instance.addClass("nowrap");
        }



        var _prepareFooter = function (settings, page, lable) {
            var tr = "",
                    trSection = '';

            if (page === "all") {
                trSection = 'data-section="all_pages"';
            }

            tr += "<tr " + trSection + ">";

            $.each(settings.columns, function (index, column) {

                var thAttr = "class = 'tf-blank' ",
                        thLable = " ";


                if (settings.summation[0] && settings.summation[0].column - 1 === index) {
                    thLable = lable;
                    thAttr = "class = 'tf-lable' ";
                }

                $.each(settings.summation, function (fIndex, sumColumn) {
                    if (sumColumn.column === index) {
                        thAttr = "class = 'tf-result text-right' ";
                        thAttr += 'data-' + page + '-page="' + sumColumn.column + '"';
                    }
                });

                tr += "<th " + thAttr + ">";
                tr += thLable;
                tr += "</th>";

            });
            tr += "</tr>";

            return tr;

        };

        //add summation footer 
        //don't add it on mobile view. We'll show another field in mobile view.

        if (settings.summation && settings.summation.length && !settings.isMobile) {
            var content = "<tfoot>";

            content += _prepareFooter(settings, 'current', AppLanugage.total);
            content += _prepareFooter(settings, 'all', AppLanugage.totalOfAllPages);

            content += "</tfoot>";

            $instance.html(content);
        }




        settings._visible_columns = [];
        $.each(settings.columns, function (index, column) {
            if (column.visible !== false) {
                settings._visible_columns.push(index);
            }

            //set orderable: false if serverSide:true and don't have order_by reference. 
            //also check if dependant sorting column has order_by reference
            var orderable = false;

            if (settings.serverSide) {
                if (column.order_by) {
                    orderable = true;
                } else if (!column.order_by && column.iDataSort && settings.columns[column.iDataSort].order_by) {
                    orderable = true;
                }
            } else {
                if (column.sortable !== false) {
                    orderable = true;
                }
            }

            settings.columns[index].orderable = orderable;

        });


        settings._exportable = settings.xlsColumns.length + settings.pdfColumns.length + settings.printColumns.length;
        settings._firstDayOfWeek = AppHelper.settings.firstDayOfWeek || 0;
        settings._inputDateFormat = "YYYY-MM-DD";


        settings = prepareDefaultFilters(settings);

        var aLengthMenu = [[10, 25, 50, 100, -1], [10, 25, 50, 100, AppLanugage.all]];
        if (settings.serverSide) {
            aLengthMenu = [[10, 25, 50, 100], [10, 25, 50, 100]];
        }

        var datatableOptions = {

            // sAjaxSource: settings.source,

            ajax: {
                url: settings.source,
                type: "POST",
                data: function (postData) {



                    var order_by_index = (postData.order && postData.order[0]) ? postData.order[0].column : "",
                            order_dir = (postData.order && postData.order[0]) ? postData.order[0].dir : "",
                            search = postData.search ? postData.search['value'] : "";

                    if (order_dir) {
                        order_dir = order_dir.toUpperCase();
                    }


                    var server_side = 0;
                    if (settings.serverSide) {
                        server_side = 1;
                    }

                    return $.extend({
                        order_by: settings.columns[order_by_index] ? settings.columns[order_by_index].order_by : "",
                        order_dir: order_dir,
                        search_by: search,
                        skip: postData.start,
                        limit: postData.length,
                        draw: postData.draw,
                        server_side: server_side
                    }, settings.filterParams);
                }
            },
            sServerMethod: "POST",
            columns: settings.columns,
            bProcessing: true,
            serverSide: settings.serverSide,
            iDisplayLength: settings.displayLength,
            aLengthMenu: aLengthMenu,
            bAutoWidth: false,
            bSortClasses: false,
            order: settings.order,
            stateSave: settings.stateSave,
            responsive: settings.responsive,
            fnStateLoadParams: function (oSettings, oData) {

                //if the stateSave is true, we'll remove the search value after next reload. 
                if (oData && oData.search) {
                    oData.search.search = "";
                }

            },
            stateDuration: settings.stateDuration,
            fnInitComplete: function () {
                settings.onInitComplete(this);
            },
            language: {
                lengthMenu: "_MENU_",
                zeroRecords: settings.customLanguage.noRecordFoundText,
                info: "_START_-_END_ / _TOTAL_",
                sInfo: "_START_-_END_ / _TOTAL_",
                infoFiltered: "(_MAX_)",
                search: "",
                searchPlaceholder: settings.customLanguage.searchPlaceholder,
                sInfoEmpty: "0-0 / 0",
                sInfoFiltered: "(_MAX_)",
                sInfoPostFix: "",
                sInfoThousands: ",",
                sProcessing: "<div class='table-loader'><span class='loading'></span></div>",
                "oPaginate": {
                    "sPrevious": "<i data-feather='chevrons-left' class='icon-16'></i>",
                    "sNext": "<i data-feather='chevrons-right' class='icon-16'></i>"
                }

            },
            sDom: "",
            footerCallback: function (row, data, start, end, display) {
                var instance = this;
                if (settings.summation) {

                    var pageInfo = instance.api().page.info(),
                            summationContent = "",
                            pageTotalContent = "",
                            allPageTotalContent = "";

                    if (pageInfo.recordsTotal) {
                        $(instance).find("tfoot").show();
                    } else {
                        $(instance).find("tfoot").hide();
                        return false;
                    }

                    $.each(settings.summation, function (index, option) {
                        // total value of current page
                        var pageTotal = calculateDatatableTotal(instance, option.column, function (currentValue) {

                            //if we get <b> tag, we'll assume that is a group total. ignore the value
                            if (currentValue && !currentValue.startsWith("<b>")) {
                                if (option.dataType === "currency") {
                                    if (option.dynamicSymbol) { //find out currency symbol 
                                        var x = currentValue;
                                        option.currencySymbol = x.replace(/[0-9.,-]/g, "");
                                    }

                                    return unformatCurrency(currentValue, option.conversionRate);
                                } else if (option.dataType === "time") {
                                    return moment.duration(currentValue).asSeconds();
                                } else if (option.dataType === "number") {
                                    return unformatCurrency(currentValue);
                                } else {
                                    return currentValue;
                                }
                            } else {
                                return 0;
                            }

                        }, true);

                        if (option.dataType === "currency") {
                            pageTotal = toCurrency(pageTotal, option.currencySymbol);
                        } else if (option.dataType === "time") {
                            pageTotal = secondsToTimeFormat(pageTotal);
                        } else if (option.dataType === "number") {
                            pageTotal = toCurrency(pageTotal, "none");
                        }

                        var pagTotalTitle = table.column(option.column).header();
                        if (pagTotalTitle) {
                            pageTotalContent += "<div class='box'><div class='box-content'>" + $(pagTotalTitle).html() + "</div><div class='box-content text-right'>" + pageTotal + "</div></div>";
                        }

                        $(instance).find("[data-current-page=" + option.column + "]").html(pageTotal);

                        // total value of all pages
                        if (pageInfo.pages > 1) {
                            $(instance).find("[data-section='all_pages']").show();
                            var total = calculateDatatableTotal(instance, option.column, function (currentValue) {

                                //if we get <b> tag, we'll assume that is a group total. ignore the value
                                if (currentValue && !currentValue.startsWith("<b>")) {
                                    if (option.dataType === "currency") {
                                        return unformatCurrency(currentValue, option.conversionRate);
                                    } else if (option.dataType === "time") {
                                        return moment.duration(currentValue).asSeconds();
                                    } else if (option.dataType === "number") {
                                        return unformatCurrency(currentValue);
                                    } else {
                                        return currentValue;
                                    }
                                } else {
                                    return 0;
                                }
                            });

                            if (option.dataType === "currency") {
                                total = toCurrency(total, option.currencySymbol);
                            } else if (option.dataType === "time") {
                                total = secondsToTimeFormat(total);
                            } else if (option.dataType === "number") {
                                total = toCurrency(total, "none");
                            }

                            var title = table.column(option.column).header();
                            if (title) {
                                allPageTotalContent += "<div class='box'><div class='box-content'>" + $(title).html() + "</div><div class='box-content text-right'>" + total + "</div></div>";
                            }

                            $(instance).find("[data-all-page=" + option.column + "]").html(total);
                        } else {
                            $(instance).find("[data-section='all_pages']").hide();
                        }
                    });



                    //add summation section for mobile view.

                    if (settings.isMobile) {
                        if (pageTotalContent) {
                            summationContent += "<div class='box'><div class='box-content strong'>" + AppLanugage.total + "</div></div>" + pageTotalContent;
                        }
                        if (allPageTotalContent) {
                            summationContent += "<div class='box'><div class='box-content strong'>" + AppLanugage.totalOfAllPages + "</div></div>" + allPageTotalContent;
                        }

                        $(".summation-section").html(summationContent);
                    }

                }

                settings.footerCallback(row, data, start, end, display, instance);
            },
            fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                settings.rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull);
            }
        };



        //to save the datatatable state in cookie, we'll use the user's reference.
        //sometime the same user (most of the time the admin user) will login to different account to check. 
        //since the table columns are different for different users, 
        //we'll save the coockie based on table reference + user reference 

        if (AppHelper.userId) {

            datatableOptions.stateSaveParams = function (settings, data) {
                if (settings.sInstance.indexOf("-user-ref-") === -1) {
                    settings.sInstance += "-user-ref-" + AppHelper.userId;
                }
            };


            datatableOptions.stateLoadCallback = function (settings) {
                if (settings.sInstance.indexOf("-user-ref-") === -1) {
                    settings.sInstance += "-user-ref-" + AppHelper.userId;
                }
                try {
                    return JSON.parse(
                            (settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
                            'DataTables_' + settings.sInstance + '_' + location.pathname
                            )
                            );
                } catch (e) {
                }
            };
        }




        var sDomExport = "";

        if (settings._exportable) {
            var datatableButtons = [];

            if (settings.xlsColumns.length) {
                //add excel button

                datatableButtons.push({
                    extend: 'excelHtml5',
                    footer: true,
                    text: settings.customLanguage.excelButtonText,
                    exportOptions: {
                        columns: settings.xlsColumns
                    },
                    customize: function (xls) {
                        //append the total of all pages row, if it exists
                        if ($instance.find("[data-section='all_pages']") && $instance.find("[data-section='all_pages']").css('display') !== "none") {
                            var sheet = xls.xl.worksheets['sheet1.xml'];

                            var $sheetSelector = $(sheet.childNodes[0].childNodes[1]);
                            var thisRowNumber = parseInt($sheetSelector.find("row:last-child").attr("r")) + 1;

                            //here should define the actual position of the item using the abc character
                            var chars = 'abcdefghijklmnopqrstuvwxyz',
                                    rowCounted = 0;

                            var rowDom = '<row r="' + thisRowNumber + '">';

                            $instance.find("[data-section='all_pages'] th").each(function () {
                                if ($(this).text()) {
                                    rowDom += '<c t="inlineStr" r="' + chars[rowCounted].toUpperCase() + thisRowNumber + '" s="2">';
                                    rowDom += '<is>';
                                    rowDom += '<t>' + $(this).text() + '</t>';
                                    rowDom += '</is>';
                                    rowDom += '</c>';
                                }

                                //increase the position variable
                                rowCounted = rowCounted + 1;
                            });

                            rowDom += '</row>';

                            //add the row finally
                            sheet.childNodes[0].childNodes[1].innerHTML = sheet.childNodes[0].childNodes[1].innerHTML + rowDom;
                        }
                    }
                });

                /* flash button
                 datatableButtons.push({
                 sExtends: "xls",
                 sButtonText: settings.customLanguage.excelButtonText,
                 mColumns: settings.xlsColumns
                 });
                 */
            }

            if (settings.pdfColumns.length) {
                //add pdf button

                datatableButtons.push({
                    extend: 'pdfHtml5',
                    exportOptions: {
                        // columns: settings.pdfColumns
                        columns: ':visible:not(.option)'
                    }
                });

                /*
                 datatableButtons.push({
                 sExtends: "pdf",
                 mColumns: settings.pdfColumns
                 });
                 */
            }

            if (settings.printColumns.length) {
                datatableButtons.push({
                    extend: 'print',
                    autoPrint: false,
                    text: settings.customLanguage.printButtonText,
                    footer: true,
                    exportOptions: {
                        columns: settings.printColumns
                    },
                    customize: function (win) {
                        $(win.document.body).closest("html").addClass("dt-print-view");

                        //append the total of all pages row, if it exists
                        if ($instance.find("[data-section='all_pages']") && $instance.find("[data-section='all_pages']").css('display') !== "none") {
                            var totalOfAllPagesClone = $instance.find("[data-section='all_pages']").clone();
                            $(win.document.body).find("tfoot").append(totalOfAllPagesClone);
                        }
                    },
                    customizeData: function (a, b, c) {

                    }
                });

            }

            datatableOptions.buttons = datatableButtons;

            sDomExport = "<'datatable-export filter-item-box'B >";
            // datatableOptions.oTableTools = {aButtons: datatableButtons};
        }

        var filterFormDom = "";
        if (settings.smartFilterIdentity) {
            filterFormDom = "<'filter-form'>";
        }


        //set custom toolbar
        if (!settings.hideTools) {
            datatableOptions.sDom = "<'filter-section-container' <'filter-section-flex-row' <'filter-section-left'> <'filter-section-right' " + sDomExport + " <'filter-item-box' f> > > " + filterFormDom + " r>t<'datatable-tools clearfix row'<'col-md-3 pl15'<'summation-section'> li><'col-md-9 pr15'p>>";
        }



        datatableOptions.drawCallback = function () {
            if (settings.serverSide) {
                $instance.closest(".dataTables_wrapper").find("input[type=search]").val((settings.filterParams && settings.filterParams.search_by) ? settings.filterParams.search_by : "");
            }
        };

        var oTable = $instance.dataTable(datatableOptions),
                $instanceWrapper = $instance.closest(".dataTables_wrapper");

        var tableId = $instance.get(0) ? $instance.get(0).id : "id_not_found";

        if (!window.appTables) {
            window.appTables = [];
        }
        window.appTables[tableId] = oTable;



        $instanceWrapper.find("select").select2({
            minimumResultsForSearch: -1
        });


        //add the column show/hide option
        if (settings.columnShowHideOption) {

            var tableId = $instance.attr("id");
            table = $instance.DataTable();

            //prepare a popover
            var popover = '<div class="filter-item-box"><button class="btn btn-default column-show-hide-popover" data-container="body" data-bs-toggle="popover" data-placement="bottom"><i data-feather="columns" class="icon-16"></i></button></div>';
            $instanceWrapper.find(".filter-section-left").append(popover);

            //prepare the list of columns when opening the popover
            $instanceWrapper.find(".column-show-hide-popover").popover({
                html: true,
                sanitize: false,
                content: function () {
                    var tableColumns = "";

                    $.each(settings.columns, function (index, column) {
                        //in coulmn list, show only the visible columns
                        if (column.visible !== false) {

                            var tableColumn = table.column(index),
                                    columnHiddenClass = "",
                                    eyeOnOffIcon = "";

                            if (!tableColumn.visible()) {
                                columnHiddenClass = "active";
                                eyeOnOffIcon = "<i data-feather='eye-off' class='icon-16 mr10'></i>";
                            }


                            //prepare a list of columns
                            tableColumns += "<li class='" + columnHiddenClass + " list-group-item clickable toggle-table-column' data-column='" + index + "'>" + eyeOnOffIcon + column.title + "</li>";
                        }
                    });

                    return "<ul class='list-group' data-table='" + tableId + "'>" + tableColumns + "</ul>";

                }
            });


            //show/hide column when clicking on the list items    

            $instanceWrapper.find(".column-show-hide-popover").on('shown.bs.popover', function () {
                feather.replace();

                $(".toggle-table-column").on('click', function () {

                    var instanceId = $(this).closest(".list-group").attr("data-table");

                    var column = $("#" + instanceId).DataTable().column($(this).attr('data-column'));


                    // check the actual status of the table column and toggle it
                    if (column) {
                        column.visible(!column.visible());

                        $(this).toggleClass("active");
                    }

                });
            });

        }



        if (settings.tableRefreshButton) {
            //prepare a refreshButton

            var refreshButton = '<div class="filter-item-box float-start "><button class="btn btn-default at-table-refresh-button ml15"><i data-feather="refresh-cw" class="icon-16"></i></button></div>';
            $instanceWrapper.find(".filter-section-left").append(refreshButton);

            $instanceWrapper.find(".at-table-refresh-button").on('click', function () {
                $instance.appTable({reload: true, filterParams: settings.filterParams});
            });
        }



        //hide popover when clicks on outside of the popover
        if (!$('body').hasClass("destroy-popover")) {
            $('body').addClass("destroy-popover"); //don't initiate this multiple time

            $('.destroy-popover').on('click', function (e) {
                if ($(e.target).closest("button").attr("data-bs-toggle") !== "popover" && !$(e.target).closest(".popover").length && !$(e.target).hasClass("editable")) {
                    var visiblePopoverId = $(".popover.in").attr("id");
                    $("[aria-describedby=" + visiblePopoverId + "]").trigger("click");

                }
            });
        }



        //set onReloadCallback
        $instance.data("onRelaodCallback", settings.onRelaodCallback);

        // add delay in search when applied serverside
        if (settings.serverSide) {
            var $searchBox = $instanceWrapper.find("input[type=search]");

            $searchBox.unbind().bind('input', (delayAction(function (e) {
                settings.filterParams.search_by = $(this).val();
                $instance.appTable({reload: true, filterParams: settings.filterParams});
                return;
            }, 1000)));

            //search datatable when clicks on the labels.
            $('body').on('click', "#" + $instance.get(0).id + ' .badge.clickable', function () {
                settings.filterParams.search_by = $(this).text();
                $instance.appTable({reload: true, filterParams: settings.filterParams});
                return false;
            });

            //search datatable when clicks on filter sub task icon
            $('body').on('click', "#" + $instance.get(0).id + ' .filter-sub-task-button', function () {
                settings.filterParams.search_by = $(this).attr('main-task-id');
                $instance.appTable({reload: true, filterParams: settings.filterParams});
                return false;
            });

            //remove sub tasks filter
            $('body').on('click', "#" + $instance.get(0).id + ' .remove-filter-button', function () {
                settings.filterParams.search_by = "";
                $instance.appTable({reload: true, filterParams: settings.filterParams});
                return false;
            });


        } else {
            //if not serverSide, then just re-draw the table when clicks on the labels. 
            $('body').on('click', "#" + $instance.get(0).id + ' .badge.clickable', function () {
                var value = $(this).text();

                $(this).closest(".dataTable").DataTable().search(value).draw();
                $(this).closest(".dataTables_wrapper").find("input[type=search]").val(value).focus().select();
                return false;
            });
        }



        buildFilterDom(settings, $instanceWrapper, $instance);
        var undoHandler = function (eventData) {
            $('<a class="undo-delete" href="javascript:;"><strong>' + AppLanugage.undo + '</strong></a>').insertAfter($(eventData.alertSelector).find(".app-alert-message"));
            $(eventData.alertSelector).find(".undo-delete").bind("click", function () {
                $(eventData.alertSelector).remove();
                appLoader.show();
                $.ajax({
                    url: eventData.url,
                    type: 'POST',
                    dataType: 'json',
                    data: {id: eventData.id, undo: true},
                    success: function (result) {
                        appLoader.hide();
                        if (result.success) {
                            $instance.appTable({newData: result.data, rowDeleted: true});
                            //fire success callback
                            settings.onUndoSuccess(result);
                        }
                    }
                });
            });
        };


        var rowDeleteHandler = function (result, $target) {
            var tr = $target.closest('tr'),
                    table = $instance.DataTable(),
                    undo = $target.attr('data-undo'),
                    url = $target.attr('data-action-url'),
                    id = $target.attr('data-id');

            oTable.fnDeleteRow(table.row(tr).index(), function () {
                table.page(table.page()).draw('page');
            }, false);

            var alertId = appAlert.warning(result.message, {duration: 20000});

            //fire success callback
            settings.onDeleteSuccess(result);

            //bind undo selector
            if (undo !== "0") {
                undoHandler({
                    alertSelector: alertId,
                    url: url,
                    id: id
                });
            }
        };

        var appTableDeleteConfirmationHandler = function (e) {
            deleteConfirmationHandler(e, rowDeleteHandler);
        };

        var appTableSimpleDeleteHandler = function (e) {
            deleteHandler(e, rowDeleteHandler);
        };

        var updateHandler = function (e) {
            appLoader.show();
            var $target = $(e.currentTarget);

            if (e.data && e.data.target) {
                $target = e.data.target;
            }

            var url = $target.attr("data-action-url");

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (response) {
                    if (response.success) {
                        $(".dataTable:visible").appTable({newData: response.data, dataId: response.id});
                        appAlert.success(response.message, {duration: 10000});
                    } else {
                        appAlert.error(response.message);
                    }
                    appLoader.hide();
                }
            });
        };


        window.InstanceCollection = window.InstanceCollection || {};
        window.InstanceCollection[$(this).attr("id")] = settings;

        $('body').find($instance).on('click', 'a[data-action=delete]', appTableSimpleDeleteHandler);
        $('body').find($instance).on('click', 'a[data-action=delete-confirmation]', appTableDeleteConfirmationHandler);
        $('body').find($instance).on('click', '[data-action=update]', updateHandler);

        $.fn.dataTableExt.oApi.getSettings = function (oSettings) {
            return oSettings;
        };

        $.fn.dataTableExt.oApi.fnReloadAjax = function (oSettings, filterParams) {
            this.fnClearTable(this);
            this.oApi._fnProcessingDisplay(oSettings, true);
            var that = this;

            if ($appFilterXhrRequest !== 'new') {
                //an another xhr request is already running
                return;
            }

            $appFilterXhrRequest = $.ajax({
                url: oSettings.ajax.url,
                type: "POST",
                dataType: "json",
                data: filterParams,
                success: function (json) {
                    $appFilterXhrRequest = 'new';

                    /* Got the data - add it to the table */
                    for (var i = 0; i < json.data.length; i++) {
                        that.oApi._fnAddData(oSettings, json.data[i]);
                    }

                    oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
                    that.fnDraw(that);
                    that.oApi._fnProcessingDisplay(oSettings, false);
                }
            });
        };
        $.fn.dataTableExt.oApi.fnUpdateRow = function (oSettings, data, page, renderBeforePageChange) {
            //oSettings is not any parameter, we'll get it automatically.

            if (data) {
                this.oApi._fnAddData(oSettings, data);
            }

            if (renderBeforePageChange) {
                this.fnDraw(this);
            }

            if (page) {
                this.oApi._fnPageChange(oSettings, page, true);
            } else {
                this.fnDraw(this);
            }

        };

    };
})(jQuery);


deleteHandler = function (e, callback) {
    appLoader.show();
    var $target = $(e.currentTarget);

    if (e.data && e.data.target) {
        $target = e.data.target;
    }

    var url = $target.attr('data-action-url'),
            id = $target.attr('data-id'),
            reloadOnSuccess = $target.attr('data-reload-on-success');

    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: {id: id},
        success: function (result) {
            if (result.success) {

                if (callback) {
                    callback(result, $target);
                }

                if (reloadOnSuccess) {
                    location.reload();
                }

            } else {
                appAlert.error(result.message);
            }
            appLoader.hide();
        }
    });
}


deleteConfirmationHandler = function (e, callback) {
    var $deleteButton = $("#confirmDeleteButton"),
            $target = $(e.currentTarget);
    //copy attributes

    $target.each(function () {
        $.each(this.attributes, function () {
            if (this.specified && this.name.match("^data-")) {
                $deleteButton.attr(this.name, this.value);
            }

        });
    });

    $target.attr("data-undo", "0"); //don't show undo

    //bind click event
    $deleteButton.unbind("click");
    $deleteButton.on("click", {target: $target}, function (e) {
        deleteHandler(e, callback);
    });

    $("#confirmationModal").modal('show');
};



// appAlert
(function (define) {
    define(['jquery'], function ($) {
        return (function () {
            var appAlert = {
                info: info,
                success: success,
                warning: warning,
                error: error,
                options: {
                    container: "body", // append alert on the selector
                    duration: 0, // don't close automatically,
                    showProgressBar: true, // duration must be set
                    clearAll: true, //clear all previous alerts
                    animate: true //show animation
                }
            };

            return appAlert;

            function info(message, options) {
                this._settings = _prepear_settings(options);
                this._settings.alertType = "info";
                _show(message);
                return "#" + this._settings.alertId;
            }

            function success(message, options) {
                this._settings = _prepear_settings(options);
                this._settings.alertType = "success";
                _show(message);
                return "#" + this._settings.alertId;
            }

            function warning(message, options) {
                this._settings = _prepear_settings(options);
                this._settings.alertType = "warning";
                _show(message);
                return "#" + this._settings.alertId;
            }

            function error(message, options) {
                this._settings = _prepear_settings(options);
                this._settings.alertType = "error";
                _show(message);
                return "#" + this._settings.alertId;
            }

            function _template(message) {
                var className = "info";
                if (this._settings.alertType === "error") {
                    className = "danger";
                } else if (this._settings.alertType === "success") {
                    className = "success";
                } else if (this._settings.alertType === "warning") {
                    className = "warning";
                }

                if (this._settings.animate) {
                    className += " animate";
                }

                return '<div id="' + this._settings.alertId + '" class="app-alert alert alert-' + className + ' alert-dismissible " role="alert">'
                        + '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert" aria-label="Close"></button>'
                        + '<div class="app-alert-message">' + message + '</div>'
                        + '<div class="progress">'
                        + '<div class="progress-bar bg-' + className + ' hide" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 100%">'
                        + '</div>'
                        + '</div>'
                        + '</div>';
            }

            function _prepear_settings(options) {
                if (!options)
                    var options = {};
                options.alertId = "app-alert-" + _randomId();
                return this._settings = $.extend({}, appAlert.options, options);
            }

            function _randomId() {
                var id = "";
                var keys = "abcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 5; i++)
                    id += keys.charAt(Math.floor(Math.random() * keys.length));
                return id;
            }

            function _clear() {
                if (this._settings.clearAll) {
                    $("[role='alert']").remove();
                }
            }

            function _show(message) {
                _clear();
                var container = $(this._settings.container);
                if (container.length) {
                    if (this._settings.animate) {
                        //show animation
                        setTimeout(function () {
                            $(".app-alert").animate({
                                opacity: 1,
                                right: "40px"
                            }, 500, function () {
                                $(".app-alert").animate({
                                    right: "15px"
                                }, 300);
                            });
                        }, 20);
                    }

                    $(this._settings.container).prepend(_template(message));
                    _progressBarHandler();
                } else {
                    console.log("appAlert: container must be an html selector!");
                }
            }

            function _progressBarHandler() {
                if (this._settings.duration && this._settings.showProgressBar) {
                    var alertId = "#" + this._settings.alertId;
                    var $progressBar = $(alertId).find('.progress-bar');

                    $progressBar.removeClass('hide').width(0);
                    var css = "width " + this._settings.duration + "ms ease";
                    $progressBar.css({
                        WebkitTransition: css,
                        MozTransition: css,
                        MsTransition: css,
                        OTransition: css,
                        transition: css
                    });

                    setTimeout(function () {
                        if ($(alertId).length > 0) {
                            $(alertId).remove();
                        }
                    }, this._settings.duration);
                }
            }
        })();
    });
}(function (d, f) {
    window['appAlert'] = f(window['jQuery']);
}));


(function (define) {
    define(['jquery'], function ($) {
        return (function () {
            var appLoader = {
                show: show,
                hide: hide,
                options: {
                    container: 'body',
                    zIndex: "auto",
                    css: "",
                }
            };

            return appLoader;

            function show(options) {
                var $template = $("#app-loader");
                this._settings = _prepear_settings(options);
                if (!$template.length) {
                    var $container = $(this._settings.container);
                    if ($container.length) {
                        $container.append('<div id="app-loader" class="app-loader" style="z-index:' + this._settings.zIndex + ';' + this._settings.css + '"><div class="loading"></div></div>');
                    } else {
                        console.log("appLoader: container must be an html selector!");
                    }

                }
            }

            function hide() {
                var $template = $("#app-loader");
                if ($template.length) {
                    $template.remove();
                }
            }

            function _prepear_settings(options) {
                if (!options)
                    var options = {};
                return this._settings = $.extend({}, appLoader.options, options);
            }
        })();
    });
}(function (d, f) {
    window['appLoader'] = f(window['jQuery']);
}));

/*prepare html form data for suitable ajax submit*/
function encodeAjaxPostData(html) {
    html = replaceAll("=", "~", html);
    html = replaceAll("&", "^", html);
    return html;
}

//replace all occurrences of a string
function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

(function (define) {
    define(['jquery'], function ($) {
        return (function () {
            var appContentModal = {
                init: init,
                destroy: destroy,
                options: {
                    url: "",
                    css: "",
                    sidebar: true
                }
            };

            return appContentModal;

            function escKeyEvent(e) {
                if (e.keyCode === 27) {
                    destroy();
                }
            }

            function init(options) {
                this._settings = _prepear_settings(options);
                _load_template(this._settings);
            }

            function destroy() {
                $(".app-modal").remove();
                $(document).unbind("keyup", escKeyEvent);
                if (typeof appModalXhr !== 'undefined') {
                    appModalXhr.abort();
                }
            }

            function _prepear_settings(options) {
                if (!options)
                    options = {};

                return this._settings = $.extend({}, appLoader.options, options);
            }

            function _load_template(settings) {

                var sidebar = "<div class='app-modal-sidebar hidden-xs'>\
                                        <div class='clearfix'>\
                                            <div class='app-modal-files-button float-start'>\
                                                <span class='app-modal-previous-button clickable'><i data-feather='chevron-left' class='icon-18'></i></span>\
                                                <span class='app-modal-next-button clickable'><i data-feather='chevron-right' class='icon-18'></i></span>\
                                            </div>\
                                            <div class='app-modal-close float-end'><span>&times;</span></div>\
                                        </div>\
                                        <div class='app-moadl-sidebar-scrollbar'>\
                                            <div class='app-modal-sidebar-area'>\
                                            </div>\
                                        </div>\
                                    </div>";
                var controlIcon = "<span class='expand hidden-xs'><i data-feather='maximize-2' class='icon-16'></i></span>";

                if (settings.sidebar === false || isMobile()) {
                    sidebar = "";
                    controlIcon = "<div class='app-modal-close app-modal-fixed-close-button'><span>&times;</span></div>";
                }

                var template = "<div class='app-modal loading'>\
                                <span class='compress'><i data-feather='minimize-2' class='icon-16'></i></span>\
                                <div class='app-modal-body'>\
                                    <div class='app-modal-content'>" + controlIcon +
                        "<div class='hide app-modal-close'><span>&times;</span></div>\
                                        <div class='app-modal-content-area d-inline-block'>\
                                        </div>\
                        </div>" + sidebar + "</div>\
                            </div>";
                destroy();
                $("body").prepend(template);


                setTimeout(function () {
                    var windowHeight = $(window).height() - 60;
                    if ($(".app-modal-content-area").prop("scrollHeight") > windowHeight) {
                        $(".app-modal-content-area").css({"max-height": windowHeight + "px", "overflow-y": "scroll", "width": "100%"});
                    }


                    if ($.fn.mCustomScrollbar) {
                        $('.app-moadl-sidebar-scrollbar').mCustomScrollbar({setHeight: windowHeight, theme: "minimal-dark", autoExpandScrollbar: true});
                    }
                }, 200);


                $(".expand").click(function () {
                    $(".app-modal").addClass("full-content");
                });

                $(".compress").click(function () {
                    $(".app-modal").removeClass("full-content");
                });
                $(".app-modal-close").click(function () {
                    destroy();
                });

                $(".app-modal-previous-button").click(function () {
                    showPreviousFile();
                });

                $(".app-modal-next-button").click(function () {
                    showNextFile();
                });

                $(document).bind("keyup", escKeyEvent);
                appLoader.show({container: '.app-modal', css: "top:35%; right:48%;"});

                appModalXhr = $.ajax({
                    url: settings.url || "",
                    data: {},
                    cache: false,
                    type: 'POST',
                    success: function (response) {
                        var $content = $(response);
                        $(".app-modal-content-area").html($content.find(".app-modal-content").html());
                        $(".app-modal-sidebar-area").html($content.find(".app-modal-sidebar").html());
                        $content.remove();
                        $(".app-modal").removeClass("loading");
                        appLoader.hide();
                    },
                    statusCode: {
                        404: function () {
                            appContentModal.destroy();
                            appAlert.error("404: Page not found.");
                        }
                    },
                    error: function () {
                        appContentModal.destroy();
                        appAlert.error("500: Internal Server Error.");
                    }
                });

            }
        })();
    });
}(function (d, f) {
    window['appContentModal'] = f(window['jQuery']);
}));

//custom daterange controller
(function ($) {
    $.fn.appDateRange = function (options) {
        var defaults = {
            dateRangeType: "yearly",
            filterParams: {},
            onChange: function (dateRange) {
            },
            onInit: function (dateRange) {
            }
        };
        var settings = $.extend({}, defaults, options);
        settings._inputDateFormat = "YYYY-MM-DD";

        this.each(function () {

            var $instance = $(this);
            var dom = '<div class="ml15 btn-group">'
                    + '<button data-act="prev" class="btn btn-default date-range-selector"><i data-feather="chevron-left" class="icon-16"></i></button>'
                    + '<button data-act="datepicker" class="btn btn-default"></button>'
                    + '<button data-act="next"  class="btn btn-default date-range-selector"><i data-feather="chevron-right" class="icon-16"></i></button>'
                    + '</div>';
            $instance.append(dom);

            var $datepicker = $instance.find("[data-act='datepicker']"),
                    $dateRangeSelector = $instance.find(".date-range-selector");

            if (settings.dateRangeType === "yearly") {
                var inityearSelectorText = function ($elector) {
                    $elector.html(moment(settings.filterParams.start_date).format("YYYY"));
                };

                inityearSelectorText($datepicker);

                //bind the click events
                $datepicker.datepicker({
                    format: "YYYY-MM",
                    viewMode: "years",
                    minViewMode: "years",
                    autoclose: true,
                    language: "custom",
                    orientation: "bottom"
                }).on('changeDate', function (e) {
                    var date = moment(e.date).format(settings._inputDateFormat),
                            year = moment(date).format("YYYY");
                    settings.filterParams.start_date = year + "-01-01";
                    settings.filterParams.end_date = year + "-12-31";
                    settings.filterParams.year = year;
                    inityearSelectorText($datepicker);
                    settings.onChange(settings.filterParams);
                });

                //init default date
                var year = moment().format("YYYY");
                settings.filterParams.start_date = year + "-01-01";
                settings.filterParams.end_date = year + "-12-31";
                settings.filterParams.year = year;
                settings.onInit(settings.filterParams);


                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"),
                            startDate = moment(settings.filterParams.start_date),
                            endDate = moment(settings.filterParams.end_date);
                    if (type === "next") {
                        startDate = startDate.add(1, 'years').format(settings._inputDateFormat);
                        endDate = endDate.add(1, 'years').format(settings._inputDateFormat);
                    } else if (type === "prev") {
                        startDate = startDate.subtract(1, 'years').format(settings._inputDateFormat);
                        endDate = endDate.subtract(1, 'years').format(settings._inputDateFormat);
                    }

                    settings.filterParams.start_date = startDate;
                    settings.filterParams.end_date = endDate;
                    settings.filterParams.year = moment(startDate).format("YYYY");

                    inityearSelectorText($datepicker);
                    settings.onChange(settings.filterParams);
                });


            } else if (settings.dateRangeType === "monthly") {

                var initMonthSelectorText = function ($elector) {
                    $elector.html(moment(settings.filterParams.start_date).format("MMMM YYYY"));
                };

                //prepareDefaultDateRangeFilterParams();
                initMonthSelectorText($datepicker);

                //bind the click events
                $datepicker.datepicker({
                    format: "YYYY-MM",
                    viewMode: "months",
                    minViewMode: "months",
                    autoclose: true,
                    language: "custom",
                }).on('changeDate', function (e) {
                    var date = moment(e.date).format(settings._inputDateFormat);
                    var daysInMonth = moment(date).daysInMonth(),
                            yearMonth = moment(date).format("YYYY-MM");
                    settings.filterParams.start_date = yearMonth + "-01";
                    settings.filterParams.end_date = yearMonth + "-" + daysInMonth;
                    initMonthSelectorText($datepicker);
                    settings.onChange(settings.filterParams);
                });

                //init default date
                var year = moment().format("YYYY");
                var yearMonth = moment().format("YYYY-MM");
                var daysInMonth = moment().daysInMonth();

                settings.filterParams.start_date = yearMonth + "-01";
                settings.filterParams.end_date = yearMonth + "-" + daysInMonth;
                settings.filterParams.year = year;
                settings.onInit(settings.filterParams);

                $dateRangeSelector.click(function () {
                    var type = $(this).attr("data-act"),
                            startDate = moment(settings.filterParams.start_date),
                            endDate = moment(settings.filterParams.end_date);
                    if (type === "next") {
                        var nextMonth = startDate.add(1, 'months'),
                                daysInMonth = nextMonth.daysInMonth(),
                                yearMonth = nextMonth.format("YYYY-MM");

                        startDate = yearMonth + "-01";
                        endDate = yearMonth + "-" + daysInMonth;

                    } else if (type === "prev") {
                        var lastMonth = startDate.subtract(1, 'months'),
                                daysInMonth = lastMonth.daysInMonth(),
                                yearMonth = lastMonth.format("YYYY-MM");

                        startDate = yearMonth + "-01";
                        endDate = yearMonth + "-" + daysInMonth;
                    }

                    settings.filterParams.start_date = startDate;
                    settings.filterParams.end_date = endDate;
                    settings.filterParams.year = moment(startDate).format("YYYY-MM");

                    initMonthSelectorText($datepicker);
                    settings.onChange(settings.filterParams);
                });
            }


        });
    };
})(jQuery);


var loadFilterView = function (settings) {
    if (settings.source && settings.targetSelector) {
        $.ajax({
            url: settings.source,
            data: settings.filterParams,
            cache: false,
            type: 'POST',
            success: function (response) {
                $(settings.targetSelector).html(response);
                appLoader.hide();
            },
            statusCode: {
                404: function () {
                    appLoader.hide();
                    appAlert.error("404: Page not found.", {container: '.modal-body', animate: false});
                }
            },
            error: function () {
                appLoader.hide();
                appAlert.error("500: Internal Server Error.", {container: '.modal-body', animate: false});
            }
        });
    }
};

//custom filters controller
(function ($) {

    $.fn.appFilters = function (options) {
        appLoader.show();

        var defaults = {
            source: "", //data url
            targetSelector: "",
            reloadSelector: "",
            dateRangeType: "", // type: daily, weekly, monthly, yearly. output params: start_date and end_date
            checkBoxes: [], // [{text: "Caption", name: "status", value: "in_progress", isChecked: true}] 
            multiSelect: [], // [{text: "Caption", name: "status", options:[{text: "Caption", value: "in_progress", isChecked: true}]}] 
            radioButtons: [], // [{text: "Caption", name: "status", value: "in_progress", isChecked: true}] 
            filterDropdown: [], // [{id: 10, text:'Caption', isSelected:true}] 
            singleDatepicker: [], // [{name: '', value:'', options:[]}] 
            rangeDatepicker: [], // [{startDate:{name:"", value:""},endDate:{name:"", value:""}}] 
            stateSave: true,
            ignoreSavedFilter: false, //sometimes, need to click on widget link to show specific filter. Enable for that. 
            isMobile: window.outerWidth < 800 ? true : false,
            filterParams: {customFilter: true}, //will post this vales on source url
            search: {show: false},
            customLanguage: {
                searchPlaceholder: AppLanugage.search,
                today: AppLanugage.today,
                yesterday: AppLanugage.yesterday,
                tomorrow: AppLanugage.tomorrow
            },
            beforeRelaodCallback: function () {},
            afterRelaodCallback: function () {},
            onInitComplete: function () {}
        };

        var $instance = $(this),
                $instanceWrapper = $instance; //$instanceWrapper is same as instance in this case

        var settings = $.extend({}, defaults, options);

        if (settings.reload) {
            var instance = $(this);
            var instanceSettings = window.InstanceCollection[instance.attr("id")];


            if (instance.data("beforeRelaodCallback")) {
                instance.data("beforeRelaodCallback")(instance, instanceSettings.filterParams);
            }


            loadFilterView(instanceSettings);

            if (instance.data("afterRelaodCallback")) {
                instance.data("afterRelaodCallback")(instance, instanceSettings.filterParams);
            }


            return false;
        } else {

            var filterForm = "";
            if (settings.smartFilterIdentity) {
                filterForm = "<div class='filter-form'></div>";
            }

            $instanceWrapper.append("<div class='filter-section-container'>\n\
                    <div class='filter-section-flex-row'>\n\
                            <div class='filter-section-left'></div><div class='filter-section-right'></div>\n\
                    </div>" + filterForm + "</div>");
        }

        settings._firstDayOfWeek = AppHelper.settings.firstDayOfWeek || 0;
        settings._inputDateFormat = "YYYY-MM-DD";


        settings = prepareDefaultFilters(settings);

        buildFilterDom(settings, $instanceWrapper, $instance);
        window.InstanceCollection = window.InstanceCollection || {};
        window.InstanceCollection[$instance.attr("id")] = settings;
        if (settings.onInitComplete) {
            settings.onInitComplete($instance, settings.filterParams);
        }

        loadFilterView(settings);


        //bind calbacks
        $instance.data("beforeRelaodCallback", settings.beforeRelaodCallback);
        $instance.data("afterRelaodCallback", settings.afterRelaodCallback);

    };
})(jQuery);



//find and replace all search string
replaceAllString = function (string, find, replaceWith) {
    return string.split(find).join(replaceWith);
};

//convert a number to curency format
toCurrency = function (number, currencySymbol) {

    if (AppHelper.settings.noOfDecimals == "0") {
        number = Math.round(parseFloat(number)) + ".00"; //round it and the add static 2 decimals
    } else {
        number = parseFloat(number).toFixed(2);
    }

    if (!currencySymbol) {
        currencySymbol = AppHelper.settings.currencySymbol;
    }
    var result = number.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");

    //remove (,) if thousand separator is (space)
    if (AppHelper.settings.thousandSeparator === " ") {
        result = result.replace(',', ' ');
    }
    if (AppHelper.settings.decimalSeparator === ",") {
        result = replaceAllString(result, ".", "_");
        result = replaceAllString(result, ",", ".");
        result = replaceAllString(result, "_", ",");
    }
    if (currencySymbol === "none") {
        currencySymbol = "";
    }
    if (AppHelper.settings.noOfDecimals == "0") {
        result = result.slice(0, -3); //remove decimals
    }

    if (AppHelper.settings.currencyPosition === "right") {
        return  result + "" + currencySymbol;
    } else {
        if (result.indexOf("-") == "0") {
            result = result.replace('-', '');
            return "-" + currencySymbol + result;
        } else {
            return  currencySymbol + "" + result;
        }
    }
};


calculateDatatableTotal = function (instance, columnNumber, valueModifier, currentPage) {
    var api = instance.api(),
            columnOption = {};
    if (currentPage) {
        columnOption = {page: 'current'};
    }

    return api.column(columnNumber, columnOption).data()
            .reduce(function (previousValue, currentValue, test, test2) {
                if (valueModifier) {
                    return previousValue + valueModifier(currentValue);
                } else {
                    return previousValue + currentValue;
                }
            }, 0);
};

// rmove the formatting to get integer data
unformatCurrency = function (currency, conversionRate) {
    currency = currency.toString();
    var mainAmount = currency, decimalSeparatorUnformatted = false;

    if (currency) {
        currency = currency.replace(/[^0-9.,-]/g, '');

        if (conversionRate) {
            //prepare converted amount
            var currencySymbol = mainAmount.replace(currency, '');
            if (conversionRate[currencySymbol]) {
                //conversion rate exists for this currency
                currency = unformatDecimalSeparator(currency);
                currency = ((1 / conversionRate[currencySymbol]) * 1) * currency;
                currency = currency.toString();
                decimalSeparatorUnformatted = true;
            }
        }

        if (currency.indexOf(".") == 0 || currency.indexOf(",") == 0) {
            currency = currency.slice(1);
        }

        if (!decimalSeparatorUnformatted) {
            currency = unformatDecimalSeparator(currency);
        }

        currency = currency * 1;
    }
    if (currency) {
        return currency;
    }
    return 0;
};

unformatDecimalSeparator = function (currency) {
    if (AppHelper.settings.decimalSeparator === ",") {
        currency = replaceAllString(currency, ".", "");
        currency = replaceAllString(currency, ",", ".");
    } else {
        currency = replaceAllString(currency, ",", "");
    }
    return currency;
};

// convert seconds to hours:minutes:seconds format
secondsToTimeFormat = function (sec) {
    var sec_num = parseInt(sec, 10),
            hours = Math.floor(sec_num / 3600),
            minutes = Math.floor((sec_num - (hours * 3600)) / 60),
            seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
};

//clear datatable state
clearAppTableState = function (tableInstance) {
    if (tableInstance) {
        setTimeout(function () {
            tableInstance.api().state.clear();
        }, 200);
    }
};

//show/hide datatable column
showHideAppTableColumn = function (tableInstance, columnIndex, visible) {
    tableInstance.fnSetColumnVis(columnIndex, !!visible);
};

//appMention using at.js
(function ($) {

    $.fn.appMention = function (options) {
        var defaults = {
            at: "@",
            dataType: "json",
            source: "",
            data: {}
        };

        var settings = $.extend({}, defaults, options);

        var selector = this;

        $.ajax({
            url: settings.source,
            data: settings.data,
            dataType: settings.dataType,
            method: "POST",
            success: function (result) {
                if (result.success) {
                    $(selector).atwho({
                        at: settings.at,
                        data: result.data,
                        insertTpl: '${content}'
                    });
                }
            }
        });

    };
})(jQuery);

//custom multi-select controller
(function ($) {
    $.fn.appMultiSelect = function (options) {
        var defaults = {
            text: "",
            options: [],
            onChange: function (values) {
            },
            onInit: function (values) {
            }
        };
        var settings = $.extend({}, defaults, options);

        this.each(function () {

            var $instance = $(this);
            var multiSelect = "", values = [];

            $.each(settings.options, function (index, listOption) {
                var active = "";

                if (listOption.isChecked) {
                    active = " active";
                    values.push(listOption.id);
                }
                //<li class=" list-group-item clickable toggle-table-column" data-column="1">ID</li>
                multiSelect += '<li class="list-group-item clickable ' + active + '" data-name="' + settings.name + '" data-value="' + listOption.id + '">';
                multiSelect += listOption.text;
                multiSelect += '</li>';
            });

            multiSelect = "<div class='dropdown-menu'><ul class='list-group' data-act='multiselect'>" + multiSelect + "</ul></div>";

            var dom = '<div class="">'
                    + '<span class="dropdown inline-block filter-multi-select">'
                    + '<button class="btn btn-default dropdown-toggle caret " type="button" data-bs-toggle="dropdown" aria-expanded="true">' + settings.text + ' </button>'
                    + multiSelect + '</span>'
                    + '</div>';

            $instance.append(dom);
            settings.onInit(values);

            var $multiselect = $instance.find("[data-name='" + settings.name + "']");
            $multiselect.click(function () {
                var $selector = $(this);
                $selector.toggleClass("active");
                setTimeout(function () {
                    var values = [];
                    $selector.parent().find("li").each(function () {
                        if ($(this).hasClass("active")) {
                            values.push($(this).attr("data-value"));
                        }
                    });
                    settings.onChange(values);
                });
                return false;
            });
        });
    };
})(jQuery);

//instant popover modifier
(function ($) {
    $.fn.appModifier = function (options) {
        var defaults = {
            actionUrl: "", //the url where the response will go after modification
            value: "", //existing value
            actionType: "select2", //action type
            showbuttons: false, //show submit/cancel button
            datepicker: {}, //options for datepicker
            select2Option: {}, //options for select2
            timepickerOptions: {}, //options for timepicker
            dataType: 'json',
            onSuccess: function () {
            }
        };

        var settings = $.extend({}, defaults, options);

        //create popover content dom
        var tempId = getRandomAlphabet(5);

        //prepare submit or close buttons
        var buttonDom = "";
        if (settings.showbuttons) {
            buttonDom = "<div class='custom-popover-button-area mt10 clearfix row'>\n\
                            <div id='custom-popover-submit-btn-" + tempId + "' class='col-md-6 pr5'><button class='btn btn-primary btn-sm w100p'><i data-feather='check' class='icon-16'></i></button></div>\n\
                            <div class='col-md-6 pl5 custom-popover-close-btn'><button class='btn btn-default btn-sm w100p'><i data-feather='x' class='icon-16'></i></button></div>\n\
                        </div>";
        }

        //prepare container dom
        var containerDom = "";
        if (settings.actionType === "select2") {
            containerDom = "<input id='" + tempId + "' value='" + settings.value + "' type='text' class='form-control popover-tempId' /> " + buttonDom;
        } else if (settings.actionType === "date") {
            var dateFormat = getJsDateFormat();
            var dateArray = settings.value.split("-"),
                    year = dateArray[0],
                    month = dateArray[1],
                    day = dateArray[2];
            var dateValue = dateFormat.replace("yyyy", year).replace("mm", month).replace("dd", day);

            containerDom = "<div style='height: 240px;' id='" + tempId + "'  data-date='" + dateValue + "' data-date-format='" + dateFormat + "' class='popover-tempId'></div>"; //set height first for right popover position
        } else if (settings.actionType === "time") {
            containerDom = "<input class='form-control' type='text' id='" + tempId + "'  value='" + settings.value + "' /><div id='popover-timepicker-container-" + tempId + "' ></div>" + buttonDom;
        }

        var $instance = $(this);
        //show popover
        var offset = $instance.offset();
        var top = offset.top;
        var leftOffset = offset.left;
        var topOffset = top + $instance.outerHeight() + 10; //10 for arrow

        //create popover dom
        var popoverDom = "<div class='app-popover' style='top: " + topOffset + "px; left: " + leftOffset + "px'>\n\
                                <span class='app-popover-arrow' ></span>\n\
                                <div class='app-popover-body'>\n\
                                    <div class='loader-container inline-loader hide'></div>\n\
                                    " + containerDom + " \n\
                                </div>\n\
                            </div>";

        $(".app-popover").remove();
        $("body").append(popoverDom);
        feather.replace();

        //apply select2/datepicker on popover content
        var $inputField = $("#" + tempId);
        var $timepickerContainer = $("#popover-timepicker-container-" + tempId);
        if (settings.actionType === "select2") {
            //select2 
            if (settings.showbuttons) {
                //submit with buttons
                $("#" + tempId).select2(settings.select2Option);
            } else {
                $("#" + tempId).select2(settings.select2Option).change(function (action) {
                    initAjaxAction($instance, $(this).val(), settings, action["added"]["text"]);
                });
            }
        } else if (settings.actionType === "date") {
            settings.datepicker.onChangeDate = function (response) {
                initAjaxAction($instance, response, settings);
            };

            setDatePicker("#" + tempId, settings.datepicker);
        } else if (settings.actionType === "time") {

            var appendWidgetTo = "#popover-timepicker-container-" + tempId;
            var showMeridian = AppHelper.settings.timeFormat == "24_hours" ? false : true;

            var timepickerSettings = $.extend({}, {
                minuteStep: AppHelper.settings.timepickerMinutesInterval,
                defaultTime: "",
                appendWidgetTo: appendWidgetTo,
                showMeridian: showMeridian,
                isInline: true
            }, settings.timepickerOptions);

            $inputField.timepicker(timepickerSettings);

            $inputField.timepicker().on('show.timepicker', function (e) {
                feather.replace();
            });

            setTimeout(function () {
                $inputField.focus();
                setTimeout(function () {
                    $(".bootstrap-timepicker-widget").removeClass("dropdown-menu");
                });
            });
        }

        //check if the right side is overflowed
        $("body").find(".app-popover").each(function () {
            //position content
            var right = $(window).width() - ($(this).offset().left + $(this).outerWidth());
            if (right < 0) {
                //overflowed
                $(this).css({"left": "unset", "right": "10px"});

                //position arrow
                var right = $(window).width() - ($instance.offset().left + (($instance.outerWidth() / 2) * 1));
                $(this).find(".app-popover-arrow").css({"left": "unset", "right": right});
            }
        });

        //submit button
        $("div#custom-popover-submit-btn-" + tempId).click(function () {
            initAjaxAction($instance, $inputField.val(), settings);
        });

        //close button
        $(".custom-popover-close-btn").click(function () {
            $(".app-popover").remove(); //hide popover
        });

        function initAjaxAction($instance, value, settings, changedText) {
            var popoverContentHeight = $inputField.closest(".app-popover-body").height();
            var popoverContentWidth = $inputField.closest(".app-popover-body").width();
            $inputField.closest(".app-popover-body").find(".loader-container").removeClass("hide").css({"height": popoverContentHeight, "width": popoverContentWidth});
            $inputField.closest(".app-popover-body").find(".custom-popover-button-area").addClass("hide");
            $inputField.addClass("hide");
            $timepickerContainer.addClass("hide");

            $.ajax({
                url: settings.actionUrl,
                type: 'POST',
                dataType: settings.dataType,
                data: {value: value},
                success: function (result) {
                    $(".app-popover").remove(); //hide popover
                    setTimeout(function () {
                        $inputField.closest(".app-popover-body").find(".loader-container").addClass("hide");
                        $inputField.closest(".app-popover-body").find(".custom-popover-button-area").removeClass("hide");
                        $inputField.removeClass("hide");
                        $timepickerContainer.removeClass("hide");
                    }, 200);

                    if (result.success) {
                        settings.onSuccess(result);

                        //update for select2
                        if (changedText) {
                            $instance.text(changedText);
                        }

                        $instance.attr("data-value", value); //update value for instant future use
                        $(".app-popover").remove();
                    } else {
                        appAlert.error(result.message);
                    }
                }
            });
        }
    };
})(jQuery);

//instant popover modifier
(function ($) {
    $.fn.appConfirmation = function (options) {
        var defaults = {
            title: "",
            btnConfirmLabel: "",
            btnCancelLabel: "",
            onConfirm: function () {
            }
        };

        var settings = $.extend({}, defaults, options);

        var $instance = $(this);
        //show popover
        var offset = $instance.offset();
        var top = offset.top;
        var leftOffset = offset.left;
        var bottomOffset = $(window).height() - (top - 10); //10 for arrow

        //create popover dom
        var popoverDom = "<div class='app-popover' style='bottom: " + bottomOffset + "px; left: " + leftOffset + "px'>\n\
                                <span class='app-popover-arrow bottom-arrow' ></span>\n\
                                <div class='loader-container inline-loader hide'></div>\n\
                                <div class='app-popover-content-container'>\n\
                                    <div class='confirmation-title'>" + settings.title + "</div>\n\
                                    <div class='app-popover-body pt0'>\n\
                                        <div class='custom-popover-button-area mt15 clearfix row'>\n\
                                            <div class='col-md-6 pr5'><button class='btn btn-danger btn-sm w100p confirmation-confirm-button'><i data-feather='check' class='icon-16'></i> " + settings.btnConfirmLabel + "</button></div>\n\
                                            <div class='col-md-6 pl5'><button class='btn btn-default btn-sm w100p confirmation-cancel-button'><i data-feather='x' class='icon-16'></i> " + settings.btnCancelLabel + "</button></div>\n\
                                        </div>\n\
                                    </div>\n\
                                </div>\n\
                            </div>";

        $(".app-popover").remove();
        $("body").append(popoverDom);
        feather.replace();

        //submit button
        $(".confirmation-confirm-button").click(function () {
            $(".app-popover").remove(); //hide popover
            settings.onConfirm();
        });

        //close button
        $(".confirmation-cancel-button").click(function () {
            $(".app-popover").remove(); //hide popover
        });
    };
})(jQuery);
