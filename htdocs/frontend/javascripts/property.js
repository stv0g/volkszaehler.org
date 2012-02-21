/**
 * Property handling & validation
 * 
 * @author Florian Ziegler <fz@f10-home.de>
 * @author Justin Otherguy <justin@justinotherguy.org>
 * @author Steffen Vogel <info@steffenvogel.de>
 * @copyright Copyright (c) 2011, The volkszaehler.org project
 * @package default
 * @license http://opensource.org/licenses/gpl-license.php GNU Public License
 */
/*
 * This file is part of volkzaehler.org
 * 
 * volkzaehler.org is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or any later version.
 * 
 * volkzaehler.org is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * volkszaehler.org. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Property constructor
 */
var Property = function(json) {
	$.extend(this, json);
};

/**
 * Validate value
 * @param value
 * @return boolean
 * @todo implement/test
 */
Property.prototype.validate = function(value) {
	var invalid = false;

	switch (this.type) {
		case 'string':
		case 'text':
			invalid |= (this.pattern != undefined) && value.match(this.pattern);
			invalid |= (this.min != undefined) && value.length < this.min;
			invalid |= (this.max != undefined) && value.length > this.max;
			break;

		case 'integer':
			invalid |= !value.match(/^[+-]?\d*$/);
			
		case 'float':
			invalid |= !value.match(/^[+-]?\d*(\.\d*)?$/);
			invalid |= (this.min != undefined) && value < this.min;
			invalid |= (this.max != undefined) && value > this.max;
			break;
			
		case 'boolean':
			invalid |= value != '1' && value != '';
			break;
			
		case 'multiple':
			invalid |= !this.options.contains(value);
			break;
			
		default:
			throw new Exception('EntityException', 'Unknown property');
	}
	
	return !invalid;
};

/**
 * Get form element for property
 */
Property.prototype.getInput = function(value) {
	var elm;

	switch (this.type) {
		case 'float':
		case 'integer':
		case 'string':
			elm = $('<input>').attr('type', 'text');
			
			if (this.type == 'string' && this.max) {
				elm.attr('maxlength', this.max);
			}
			break;
					
		case 'text':
			elm = $('<textarea>');
			break;
		
		case 'boolean':
			elm = $('<input>').attr('type', 'checkbox');
			break;
				
		case 'multiple':
			elm = $('<select>').attr('size', 1);
			this.options.each(function(index, option) {
				elm.append(
					$('<option>')
						.val(option)
						.text(option)
				);
			});
			break;
		
		default:
			throw new Exception('PropertyException', 'Unknown property');
	}
	
	elm
		.attr('name', this.name)
		.val(value)
		.bind('keyup keydown change', this, function(event) { // live validation
			var propdef = event.data;
			var elm = $(this);

			if (propdef.validate(elm.val()) == false && elm.val() != '') {
				elm.addClass('invalid');
			}
			else {
				elm.removeClass('invalid');
			}
		});

	return elm;
};
