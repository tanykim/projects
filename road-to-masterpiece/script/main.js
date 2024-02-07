require.config({
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        d3: '../bower_components/d3/d3',
        moment: '../bower_components/moment/moment'
    }
});
require([
    'jquery',
    'underscore',
    'd3',
    'moment',
    'vis',
    'interaction'
], function ($, _, d3, moment, Vis, I) {

    'use strict';

    var fullDrawn = false;
    var data, vis;

    //scroll
    function changeHeader() {
        var p = $(window).scrollTop();
        if (p > 150) {
            $('.js-vis-axis').addClass('fixed');
            $('.js-header-title').fadeIn('fast');
            $('.js-footer').fadeIn('fast');
        } else if (p > 50) {
            $('.js-vis-axis').removeClass('fixed');
            $('.js-header-title').fadeIn('fast');
            $('.js-footer').fadeIn('fast');
        } else {
            $('.js-vis-axis').removeClass('fixed');
            $('.js-header-title').fadeOut('fast');
            $('.js-footer').fadeOut('fast');
            $('.js-source-content').hide();
        }
    }
    var scrolled = _.debounce(changeHeader, 100);
    $(window).scroll(scrolled);

    function setDirectorPanel(w) {
        if (!w) {
            w = $('.vis').width() - vis.margin.left - vis.margin.right;
        }
        $('.js-director-more')
            .css('width', w)
            .css('left', vis.margin.left);
    }

    //add and control vis elements
    function callResponsive() {

        var screenW = $('body').width();
        var w = $('.vis').width() - vis.margin.left - vis.margin.right;

        if (screenW > 480) {

            setDirectorPanel();
            $('.js-simple-all').hide();

            if (fullDrawn) {

                //change svg and axis width
                d3.selectAll('.js-svg').attr('width', $('.vis').width());
                d3.select('.js-x-axis').attr('x2', w);
                d3.selectAll('.js-y-axis').attr('x2', w);

                //resizing all full vis elements
                I.changeAxis($('input[name=axis]:checked').data().value,
                    data, vis.x, vis.xAxis, w);

            } else {
                var axisVis = Vis.drawAxisSVG(vis.dim, vis.margin);
                vis.x = axisVis.x;
                vis.xAxis = axisVis.xAxis;
                Vis.drawFullElements(data, vis, axisVis.x.age);
                fullDrawn = true;
            }
        } else {
            $('.js-full').remove();
            fullDrawn = false;
            $('.js-director-more').css('width', '').css('left', '');
            d3.selectAll('.js-y-axis').attr('x2', w);
            $('.js-simple-all').show();
        }
    }

    //resizing
    var lazyLayout = _.debounce(callResponsive, 400);
    $(window).resize(lazyLayout);

    //social link
    $('.js-social').mouseover(function () {
        $(this).addClass('social-over');
    }).click(function () {
        if ($(this).data().value === 't') {
            window.open('https://twitter.com/intent/tweet?text=' +
                'Check the visualization of' +
                ' Oscars winners in Best Directing!' +
                ' by @tanykim http%3A%2F%2Ftany.kim%2Fmasterpiece');
        } else {
            window.open('https://www.facebook.com/sharer/sharer.php?' +
                'u=http%3A%2F%2Ftany.kim%2Fmasterpiece');
        }
    }).mouseout(function () {
        $(this).removeClass('social-over');
    });

    //retreive data
    $.getJSON('dataset.json').done(function (d) {
        $('.js-loading').addClass('hide');
        data = d.reverse(); //from newest
        $('.js-director-count').text(data.length);
        vis = Vis.drawSVG(data);

        var directorVals = _.object(_.map(data, function (datum) {
            var firstOscars = datum.awards[0].age;
            var firstDirecting = datum.movies[0].age;
            return [ datum.id,
                {
                    year: datum.years[0],
                    age: Math.floor(datum.age),
                    career: Math.round((firstOscars-firstDirecting) * 10)/10,
                    firstname: '',
                    count: datum.movies.length
                }
            ];
        }));

        callResponsive();

        I.callInteraction(data, vis, directorVals);
        I.callDirectorOpen(data, vis);
    });

    //close the intro on small screen
    $('.js-small-close').click(function () {
        $('.js-small').addClass('hide');
    });

});